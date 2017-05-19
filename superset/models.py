"""A collection of ORM sqlalchemy models for Superset"""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

from collections import OrderedDict
import functools
import json
import logging
import pickle
import re
import textwrap
from copy import deepcopy, copy
from datetime import timedelta, datetime, date

import humanize
import pandas as pd
import requests
import sqlalchemy as sqla
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import subqueryload

import sqlparse
from dateutil.parser import parse

from flask import escape, g, Markup, request
from flask_appbuilder import Model
from flask_appbuilder.models.mixins import AuditMixin
from flask_appbuilder.models.decorators import renders
from flask_appbuilder.security.sqla.models import User
from flask_babel import lazy_gettext as _

from datetime import date
from sqlalchemy import (
    Column, Integer, String, ForeignKey, Text, Boolean,
    DateTime, Date, Table, Numeric,
    create_engine, MetaData, desc, asc, select, and_, or_
)
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import backref, relationship
from sqlalchemy.orm.session import make_transient
from sqlalchemy.sql import table, literal_column, text, column
from sqlalchemy.sql.expression import ColumnClause, TextAsFrom
from sqlalchemy_utils import EncryptedType

from werkzeug.datastructures import ImmutableMultiDict

from superset import (
    app, db, db_engine_specs, get_session, utils, sm, import_util
)
from superset.source_registry import SourceRegistry
from superset.viz import viz_types
from superset.jinja_context import get_template_processor
from superset.utils import wrap_clause_in_parens, DTTM_ALIAS, QueryStatus
# from superset.utils import flasher, MetricPermException, DimSelector

config = app.config


class QueryResult(object):

    """Object returned by the query interface"""

    def __init__(  # noqa
            self,
            df,
            query,
            duration,
            status=QueryStatus.SUCCESS,
            error_message=None):
        self.df = df
        self.query = query
        self.duration = duration
        self.status = status
        self.error_message = error_message


FillterPattern = re.compile(r'''((?:[^,"']|"[^"]*"|'[^']*')+)''')


def set_perm(mapper, connection, target):  # noqa
    if target.perm != target.get_perm():
        link_table = target.__table__
        connection.execute(
            link_table.update()
            .where(link_table.c.id == target.id)
            .values(perm=target.get_perm())
        )


def set_related_perm(mapper, connection, target):  # noqa
    src_class = target.cls_model
    id_ = target.datasource_id
    ds = db.session.query(src_class).filter_by(id=int(id_)).first()
    target.perm = ds.perm


class ImportMixin(object):
    def override(self, obj):
        """Overrides the plain fields of the dashboard."""
        for field in obj.__class__.export_fields:
            setattr(self, field, getattr(obj, field))

    def copy(self):
        """Creates a copy of the dashboard without relationships."""
        new_obj = self.__class__()
        new_obj.override(self)
        return new_obj

    def alter_params(self, **kwargs):
        d = self.params_dict
        d.update(kwargs)
        self.params = json.dumps(d)

    @property
    def params_dict(self):
        if self.params:
            params = re.sub(",[ \t\r\n]+}", "}", self.params)
            params = re.sub(",[ \t\r\n]+\]", "]", params)
            return json.loads(params)
        else:
            return {}


class AuditMixinNullable(AuditMixin):

    """Altering the AuditMixin to use nullable fields

    Allows creating objects programmatically outside of CRUD
    """

    created_on = Column(DateTime, default=datetime.now, nullable=True)
    changed_on = Column(DateTime, default=datetime.now,
        onupdate=datetime.now, nullable=True)

    @declared_attr
    def created_by_fk(cls):  # noqa
        return Column(Integer, ForeignKey('ab_user.id'),
                      default=cls.get_user_id, nullable=True)

    @declared_attr
    def changed_by_fk(cls):  # noqa
        return Column(
            Integer, ForeignKey('ab_user.id'),
            default=cls.get_user_id, onupdate=cls.get_user_id, nullable=True)

    def _user_link(self, user):
        if not user:
            return ''
        url = '/superset/profile/{}/'.format(user.username)
        return Markup('<a href="{}">{}</a>'.format(url, escape(user) or ''))

    @renders('created_by')
    def creator(self):  # noqa
        return self._user_link(self.created_by)

    @property
    def changed_by_(self):
        return self._user_link(self.changed_by)

    @renders('changed_on')
    def changed_on_(self):
        return Markup(
            '<span class="no-wrap">{}</span>'.format(self.changed_on))

    @renders('changed_on')
    def modified(self):
        s = humanize.naturaltime(datetime.now() - self.changed_on)
        return Markup('<span class="no-wrap">{}</span>'.format(s))

    @property
    def icons(self):
        return """
        <a
                href="{self.datasource_edit_url}"
                data-toggle="tooltip"
                title="{self.datasource}">
            <i class="fa fa-database"></i>
        </a>
        """.format(**locals())


class Url(Model, AuditMixinNullable):

    """Used for the short url feature"""

    __tablename__ = 'url'
    id = Column(Integer, primary_key=True)
    url = Column(Text)


slice_user = Table('slice_user', Model.metadata,
    Column('id', Integer, primary_key=True),
    Column('user_id', Integer, ForeignKey('ab_user.id')),
    Column('slice_id', Integer, ForeignKey('slices.id'))
)


class Slice(Model, AuditMixinNullable, ImportMixin):

    """A slice is essentially a report or a view on data"""

    __tablename__ = 'slices'
    id = Column(Integer, primary_key=True)
    slice_name = Column(String(250))
    online = Column(Boolean, default=False)
    datasource_id = Column(Integer)
    datasource_type = Column(String(200))
    datasource_name = Column(String(2000))
    database_id = Column(Integer)
    full_table_name = Column(String(2000))
    viz_type = Column(String(250))
    params = Column(Text)
    description = Column(Text)
    department = Column(Text)
    cache_timeout = Column(Integer)
    perm = Column(String(1000))
    owners = relationship("User", secondary=slice_user)

    export_fields = ('slice_name', 'datasource_type', 'datasource_name',
                     'viz_type', 'params', 'cache_timeout')

    def __repr__(self):
        return self.slice_name

    @property
    def cls_model(self):
        return SourceRegistry.sources[self.datasource_type]

    @property
    def datasource(self):
        return self.get_datasource

    @datasource.getter
    @utils.memoized
    def get_datasource(self):
        ds = db.session.query(
            self.cls_model).filter_by(
            id=self.datasource_id).first()
        return ds

    @renders('datasource_name')
    def datasource_link(self):
        datasource = self.datasource
        if datasource:
            return self.datasource.link

    @property
    def datasource_edit_url(self):
        self.datasource.url

    @property
    @utils.memoized
    def viz(self):
        d = json.loads(self.params)
        viz_class = viz_types[self.viz_type]
        return viz_class(self.datasource, form_data=d)

    @property
    def description_markeddown(self):
        return utils.markdown(self.description)

    @property
    def data(self):
        """Data used to render slice in templates"""
        d = {}
        self.token = ''
        try:
            d = self.viz.data
            self.token = d.get('token')
        except Exception as e:
            logging.exception(e)
            d['error'] = str(e)
        d['slice_id'] = self.id
        d['slice_name'] = self.slice_name
        d['description'] = self.description
        d['slice_url'] = self.slice_url
        d['edit_url'] = self.edit_url
        d['description_markeddown'] = self.description_markeddown
        return d

    @property
    def json_data(self):
        return json.dumps(self.data)

    @property
    def slice_url(self):
        """Defines the url to access the slice"""
        try:
            slice_params = json.loads(self.params)
        except Exception as e:
            logging.exception(e)
            slice_params = {}
        slice_params['slice_id'] = self.id
        slice_params['json'] = "false"
        slice_params['slice_name'] = self.slice_name
        from werkzeug.urls import Href
        href = Href(
            "/superset/explore/{obj.datasource_type}/"
            "{obj.datasource_id}/".format(obj=self))
        return href(slice_params)

    @property
    def slice_id_url(self):
        return (
            "/superset/{slc.datasource_type}/{slc.datasource_id}/{slc.id}/"
        ).format(slc=self)

    @property
    def edit_url(self):
        return "/slicemodelview/edit/{}".format(self.id)

    @property
    def slice_link(self):
        url = self.slice_url
        name = escape(self.slice_name)
        return Markup('<a href="{url}">{name}</a>'.format(**locals()))

    def get_viz(self, url_params_multidict=None):
        """Creates :py:class:viz.BaseViz object from the url_params_multidict.

        :param werkzeug.datastructures.MultiDict url_params_multidict:
            Contains the visualization params, they override the self.params
            stored in the database
        :return: object of the 'viz_type' type that is taken from the
            url_params_multidict or self.params.
        :rtype: :py:class:viz.BaseViz
        """
        slice_params = json.loads(self.params)  # {}
        slice_params['slice_id'] = self.id
        slice_params['json'] = "false"
        slice_params['slice_name'] = self.slice_name
        slice_params['viz_type'] = self.viz_type if self.viz_type else "table"
        if url_params_multidict:
            slice_params.update(url_params_multidict)
            to_del = [k for k in slice_params if k not in url_params_multidict]
            for k in to_del:
                del slice_params[k]

        immutable_slice_params = ImmutableMultiDict(slice_params)
        return viz_types[immutable_slice_params.get('viz_type')](
            self.datasource,
            form_data=immutable_slice_params,
            slice_=self
        )

    @classmethod
    def import_obj(cls, slc_to_import, import_time=None):
        """Inserts or overrides slc in the database.

        remote_id and import_time fields in params_dict are set to track the
        slice origin and ensure correct overrides for multiple imports.
        Slice.perm is used to find the datasources and connect them.
        """
        session = db.session
        make_transient(slc_to_import)
        slc_to_import.dashboards = []
        slc_to_import.alter_params(
            remote_id=slc_to_import.id, import_time=import_time)

        # find if the slice was already imported
        slc_to_override = None
        for slc in session.query(Slice).all():
            if ('remote_id' in slc.params_dict and
                    slc.params_dict['remote_id'] == slc_to_import.id):
                slc_to_override = slc

        slc_to_import = slc_to_import.copy()
        params = slc_to_import.params_dict
        slc_to_import.datasource_id = SourceRegistry.get_datasource_by_name(
            session, slc_to_import.datasource_type, params['datasource_name'],
            params['schema'], params['database_name']).id
        if slc_to_override:
            slc_to_override.override(slc_to_import)
            session.flush()
            return slc_to_override.id
        session.add(slc_to_import)
        logging.info('Final slice: {}'.format(slc_to_import.to_json()))
        session.flush()
        return slc_to_import.id


sqla.event.listen(Slice, 'before_insert', set_related_perm)
sqla.event.listen(Slice, 'before_update', set_related_perm)


dashboard_slices = Table(
    'dashboard_slices', Model.metadata,
    Column('id', Integer, primary_key=True),
    Column('dashboard_id', Integer, ForeignKey('dashboards.id')),
    Column('slice_id', Integer, ForeignKey('slices.id')),
)

dashboard_user = Table(
    'dashboard_user', Model.metadata,
    Column('id', Integer, primary_key=True),
    Column('user_id', Integer, ForeignKey('ab_user.id')),
    Column('dashboard_id', Integer, ForeignKey('dashboards.id'))
)


class Dashboard(Model, AuditMixinNullable, ImportMixin):

    """The dashboard object!"""

    __tablename__ = 'dashboards'
    id = Column(Integer, primary_key=True)
    dashboard_title = Column(String(500))
    position_json = Column(Text)
    description = Column(Text)
    department = Column(Text)
    css = Column(Text)
    online = Column(Boolean, default=False)
    json_metadata = Column(Text)
    slug = Column(String(255), unique=True)
    slices = relationship(
        'Slice', secondary=dashboard_slices, backref='dashboards')
    owners = relationship("User", secondary=dashboard_user)

    export_fields = ('dashboard_title', 'position_json', 'json_metadata',
                     'description', 'css', 'slug')

    def __repr__(self):
        return self.dashboard_title

    @property
    def table_names(self):
        return ", ".join(
            {"{}".format(s.datasource.name) for s in self.slices})

    @property
    def url(self):
        return "/superset/dashboard/{}/".format(self.slug or self.id)

    @property
    def datasources(self):
        return {slc.datasource for slc in self.slices}

    @property
    def sqla_metadata(self):
        metadata = MetaData(bind=self.get_sqla_engine())
        return metadata.reflect()

    def dashboard_link(self):
        title = escape(self.dashboard_title)
        return Markup(
            '<a href="{self.url}">{title}</a>'.format(**locals()))

    @property
    def json_data(self):
        positions = self.position_json
        if positions:
            positions = json.loads(positions)
        d = {
            'id': self.id,
            'metadata': self.params_dict,
            'css': self.css,
            'dashboard_title': self.dashboard_title,
            'slug': self.slug,
            'slices': [slc.data for slc in self.slices],
            'position_json': positions,
        }
        return json.dumps(d)

    @property
    def params(self):
        return self.json_metadata

    @params.setter
    def params(self, value):
        self.json_metadata = value

    @property
    def position_array(self):
        if self.position_json:
            return json.loads(self.position_json)
        return []

    @classmethod
    def import_obj(cls, dashboard_to_import, import_time=None):
        """Imports the dashboard from the object to the database.

         Once dashboard is imported, json_metadata field is extended and stores
         remote_id and import_time. It helps to decide if the dashboard has to
         be overridden or just copies over. Slices that belong to this
         dashboard will be wired to existing tables. This function can be used
         to import/export dashboards between multiple superset instances.
         Audit metadata isn't copies over.
        """
        def alter_positions(dashboard, old_to_new_slc_id_dict):
            """ Updates slice_ids in the position json.

            Sample position json:
            [{
                "col": 5,
                "row": 10,
                "size_x": 4,
                "size_y": 2,
                "slice_id": "3610"
            }]
            """
            position_array = dashboard.position_array
            for position in position_array:
                if 'slice_id' not in position:
                    continue
                old_slice_id = int(position['slice_id'])
                if old_slice_id in old_to_new_slc_id_dict:
                    position['slice_id'] = '{}'.format(
                        old_to_new_slc_id_dict[old_slice_id])
            dashboard.position_json = json.dumps(position_array)

        logging.info('Started import of the dashboard: {}'
                     .format(dashboard_to_import.to_json()))
        session = db.session
        logging.info('Dashboard has {} slices'
                     .format(len(dashboard_to_import.slices)))
        # copy slices object as Slice.import_slice will mutate the slice
        # and will remove the existing dashboard - slice association
        slices = copy(dashboard_to_import.slices)
        old_to_new_slc_id_dict = {}
        new_filter_immune_slices = []
        new_expanded_slices = {}
        i_params_dict = dashboard_to_import.params_dict
        for slc in slices:
            logging.info('Importing slice {} from the dashboard: {}'.format(
                slc.to_json(), dashboard_to_import.dashboard_title))
            new_slc_id = Slice.import_obj(slc, import_time=import_time)
            old_to_new_slc_id_dict[slc.id] = new_slc_id
            # update json metadata that deals with slice ids
            new_slc_id_str = '{}'.format(new_slc_id)
            old_slc_id_str = '{}'.format(slc.id)
            if ('filter_immune_slices' in i_params_dict and
                    old_slc_id_str in i_params_dict['filter_immune_slices']):
                new_filter_immune_slices.append(new_slc_id_str)
            if ('expanded_slices' in i_params_dict and
                    old_slc_id_str in i_params_dict['expanded_slices']):
                new_expanded_slices[new_slc_id_str] = (
                    i_params_dict['expanded_slices'][old_slc_id_str])

        # override the dashboard
        existing_dashboard = None
        for dash in session.query(Dashboard).all():
            if ('remote_id' in dash.params_dict and
                    dash.params_dict['remote_id'] ==
                    dashboard_to_import.id):
                existing_dashboard = dash

        dashboard_to_import.id = None
        alter_positions(dashboard_to_import, old_to_new_slc_id_dict)
        dashboard_to_import.alter_params(import_time=import_time)
        if new_expanded_slices:
            dashboard_to_import.alter_params(
                expanded_slices=new_expanded_slices)
        if new_filter_immune_slices:
            dashboard_to_import.alter_params(
                filter_immune_slices=new_filter_immune_slices)

        new_slices = session.query(Slice).filter(
            Slice.id.in_(old_to_new_slc_id_dict.values())).all()

        if existing_dashboard:
            existing_dashboard.override(dashboard_to_import)
            existing_dashboard.slices = new_slices
            session.flush()
            return existing_dashboard.id
        else:
            # session.add(dashboard_to_import) causes sqlachemy failures
            # related to the attached users / slices. Creating new object
            # allows to avoid conflicts in the sql alchemy state.
            copied_dash = dashboard_to_import.copy()
            copied_dash.slices = new_slices
            session.add(copied_dash)
            session.flush()
            return copied_dash.id

    @classmethod
    def export_dashboards(cls, dashboard_ids):
        copied_dashboards = []
        datasource_ids = set()
        for dashboard_id in dashboard_ids:
            # make sure that dashboard_id is an integer
            dashboard_id = int(dashboard_id)
            copied_dashboard = (
                db.session.query(Dashboard)
                .options(subqueryload(Dashboard.slices))
                .filter_by(id=dashboard_id).first()
            )
            make_transient(copied_dashboard)
            for slc in copied_dashboard.slices:
                datasource_ids.add((slc.datasource_id, slc.datasource_type))
                # add extra params for the import
                slc.alter_params(
                    remote_id=slc.id,
                    datasource_name=slc.datasource.name,
                    schema=slc.datasource.name,
                    database_name=slc.datasource.database.name,
                )
            copied_dashboard.alter_params(remote_id=dashboard_id)
            copied_dashboards.append(copied_dashboard)

            eager_datasources = []
            for dashboard_id, dashboard_type in datasource_ids:
                eager_datasource = SourceRegistry.get_eager_datasource(
                    db.session, dashboard_type, dashboard_id)
                eager_datasource.alter_params(
                    remote_id=eager_datasource.id,
                    database_name=eager_datasource.database.name,
                )
                make_transient(eager_datasource)
                eager_datasources.append(eager_datasource)

            # log user action
            action_str = 'Export dashboard: {}'.format(copied_dashboard.dashboard_title)
            Log.log_action('export', action_str, 'dashboard', dashboard_id)

        return pickle.dumps({
            'dashboards': copied_dashboards,
            'datasources': eager_datasources,
        })


class Queryable(object):

    """A common interface to objects that are queryable (tables and datasources)"""

    @property
    def column_names(self):
        return sorted([c.column_name for c in self.columns])

    @property
    def main_dttm_col(self):
        return "timestamp"

    @property
    def groupby_column_names(self):
        return sorted([c.column_name for c in self.columns if c.groupby])

    @property
    def filterable_column_names(self):
        return sorted([c.column_name for c in self.columns if c.filterable])

    @property
    def dttm_cols(self):
        return []

    @property
    def url(self):
        return '/{}/edit/{}'.format(self.baselink, self.id)

    @property
    def explore_url(self):
        if self.default_endpoint:
            return self.default_endpoint
        else:
            return "/superset/explore/{obj.type}/{obj.id}/".format(obj=self)

    @property
    def data(self):
        """data representation of the datasource sent to the frontend"""
        gb_cols = [(col, col) for col in self.groupby_column_names]
        all_cols = [(c, c) for c in self.column_names]
        order_by_choices = []
        for s in sorted(self.column_names):
            order_by_choices.append((json.dumps([s, True]), s + ' [asc]'))
            order_by_choices.append((json.dumps([s, False]), s + ' [desc]'))

        d = {
            'id': self.id,
            'type': self.type,
            'name': self.name,
            'metrics_combo': self.metrics_combo,
            'order_by_choices': order_by_choices,
            'gb_cols': gb_cols,
            'all_cols': all_cols,
            'filterable_cols': self.filterable_column_names,
        }
        if (self.type == 'table'):
            grains = self.database.grains() or []
            if grains:
                grains = [(g.name, g.name) for g in grains]
            d['granularity_sqla'] = [(c, c) for c in self.dttm_cols]
            d['time_grain_sqla'] = grains
        return d


class Database(Model, AuditMixinNullable):

    """An ORM object that stores Database related information"""

    __tablename__ = 'dbs'
    type = "table"

    id = Column(Integer, primary_key=True)
    database_name = Column(String(250), unique=True)
    sqlalchemy_uri = Column(String(1024))
    password = Column(EncryptedType(String(1024), config.get('SECRET_KEY')))
    cache_timeout = Column(Integer)
    select_as_create_table_as = Column(Boolean, default=False)
    expose_in_sqllab = Column(Boolean, default=True)
    allow_run_sync = Column(Boolean, default=True)
    allow_run_async = Column(Boolean, default=False)
    allow_ctas = Column(Boolean, default=False)
    allow_dml = Column(Boolean, default=True)
    force_ctas_schema = Column(String(250))
    extra = Column(Text, default=textwrap.dedent("""\
    {
        "metadata_params": {},
        "engine_params": {}
    }
    """))
    perm = Column(String(1000))

    def __repr__(self):
        return self.database_name

    @property
    def name(self):
        return self.database_name

    @property
    def backend(self):
        url = make_url(self.sqlalchemy_uri_decrypted)
        return url.get_backend_name()

    def set_sqlalchemy_uri(self, uri):
        password_mask = "X" * 10
        conn = sqla.engine.url.make_url(uri)
        if conn.password != password_mask:
            # do not over-write the password with the password mask
            self.password = conn.password
        conn.password = password_mask if conn.password else None
        self.sqlalchemy_uri = str(conn)  # hides the password

    def test_uri(self, url):
        extra = self.get_extra()
        params = extra.get('engine_params', {})
        try:
            inspector = sqla.inspect(create_engine(url, **params))
            inspector.get_schema_names()
        except Exception:
            return False
        else:
            return True

    def fill_sqlalchemy_uri(self, user_id=None):
        try:
            if not user_id:
                user_id = g.user.get_id()
        except Exception:
            msg = "Unable to get user's id when fill sqlalchmy uri"
            logging.error(msg)
            # todo show in the frontend
            raise Exception(msg)
        url = make_url(self.sqlalchemy_uri)
        account = (
            db.session.query(DatabaseAccount)
            .filter(DatabaseAccount.user_id == user_id,
                    DatabaseAccount.database_id == self.id)
            .first()
        )
        if not account:
            user = db.session.query(User).filter(User.id == user_id).first()
            msg = "User:{} do not have account for connection:{}"\
                .format(user.username, self.database_name)
            logging.error(msg)
            # todo the frontend need to mention user to add account
            raise Exception(msg)
        url.username = account.username
        url.password = account.password
        if not self.test_uri(str(url)):
            msg = "Test connection failed, maybe need to modify your " \
                  "account for connection:{}".format(self.database_name)
            logging.error(msg)
            # todo the frontend need to mention user to add account
            raise Exception(msg)
        return str(url)

    def get_sqla_engine(self, schema=None):
        # if self.database_name == 'main':
        #     url = make_url(self.sqlalchemy_uri_decrypted)
        # else:
        #     url = make_url(self.fill_sqlalchemy_uri())
        url = make_url(self.sqlalchemy_uri_decrypted)
        extra = self.get_extra()
        params = extra.get('engine_params', {})
        if self.backend == 'presto' and schema:
            if '/' in url.database:
                url.database = url.database.split('/')[0] + '/' + schema
            else:
                url.database += '/' + schema
        elif schema:
            url.database = schema
        return create_engine(url, **params)

    def get_reserved_words(self):
        return self.get_sqla_engine().dialect.preparer.reserved_words

    def get_quoter(self):
        return self.get_sqla_engine().dialect.identifier_preparer.quote

    def get_df(self, sql, schema):
        sql = sql.strip().strip(';')
        eng = self.get_sqla_engine(schema=schema)
        #cur = eng.execute(sql, schema=schema)
        cur = eng.execute(sql)
        cols = [col[0] for col in cur.cursor.description]
        df = pd.DataFrame(cur.fetchall(), columns=cols)
        return df

    def compile_sqla_query(self, qry, schema=None):
        eng = self.get_sqla_engine(schema=schema)
        compiled = qry.compile(eng, compile_kwargs={"literal_binds": True})
        return '{}'.format(compiled)

    def select_star(
            self, table_name, schema=None, limit=100, show_cols=False,
            indent=True):
        """Generates a ``select *`` statement in the proper dialect"""
        quote = self.get_quoter()
        fields = '*'
        table = self.get_table(table_name, schema=schema)
        if show_cols:
            fields = [quote(c.name) for c in table.columns]
        if schema:
            table_name = schema + '.' + table_name
        qry = select(fields).select_from(text(table_name))
        if limit:
            qry = qry.limit(limit)
        sql = self.compile_sqla_query(qry)
        if indent:
            sql = sqlparse.format(sql, reindent=True)
        return sql

    def wrap_sql_limit(self, sql, limit=1000):
        qry = (
            select('*')
            .select_from(TextAsFrom(text(sql), ['*'])
            .alias('inner_qry')).limit(limit)
        )
        return self.compile_sqla_query(qry)

    def safe_sqlalchemy_uri(self):
        return self.sqlalchemy_uri

    @property
    def inspector(self):
        engine = self.get_sqla_engine()
        return sqla.inspect(engine)

    def all_table_names(self, schema=None):
        return sorted(self.inspector.get_table_names(schema))

    def all_view_names(self, schema=None):
        views = []
        try:
            views = self.inspector.get_view_names(schema)
        except Exception as e:
            pass
        return views

    def all_schema_names(self):
        return sorted(self.inspector.get_schema_names())

    def all_schema_table_names(self):
        st = {}
        schemas = self.all_schema_names()
        for schema in schemas:
            tables = self.all_table_names(schema)
            st[schema] = tables
        return OrderedDict(sorted(st.items(), key=lambda s: s[0]))

    @property
    def db_engine_spec(self):
        engine_name = self.get_sqla_engine().name or 'base'
        return db_engine_specs.engines.get(
            engine_name, db_engine_specs.BaseEngineSpec)

    def grains(self):
        """Defines time granularity database-specific expressions.

        The idea here is to make it easy for users to change the time grain
        form a datetime (maybe the source grain is arbitrary timestamps, daily
        or 5 minutes increments) to another, "truncated" datetime. Since
        each database has slightly different but similar datetime functions,
        this allows a mapping between database engines and actual functions.
        """
        return self.db_engine_spec.time_grains

    def grains_dict(self):
        return {grain.name: grain for grain in self.grains()}

    def get_extra(self):
        extra = {}
        if self.extra:
            try:
                extra = json.loads(self.extra)
            except Exception as e:
                logging.error(e)
        return extra

    def get_table(self, table_name, schema=None):
        extra = self.get_extra()
        meta = MetaData(**extra.get('metadata_params', {}))
        return Table(
            table_name, meta,
            schema=schema or None,
            autoload=True,
            autoload_with=self.get_sqla_engine())

    def get_columns(self, table_name, schema=None):
        return self.inspector.get_columns(table_name, schema)

    def get_indexes(self, table_name, schema=None):
        return self.inspector.get_indexes(table_name, schema)

    def get_pk_constraint(self, table_name, schema=None):
        return self.inspector.get_pk_constraint(table_name, schema)

    def get_foreign_keys(self, table_name, schema=None):
        return self.inspector.get_foreign_keys(table_name, schema)

    @property
    def sqlalchemy_uri_decrypted(self):
        conn = sqla.engine.url.make_url(self.sqlalchemy_uri)
        conn.password = self.password
        return str(conn)

    @property
    def sql_url(self):
        return '/superset/sql/{}/'.format(self.id)

    def get_perm(self):
        return (
            "[{obj.database_name}].(id:{obj.id})").format(obj=self)

sqla.event.listen(Database, 'after_insert', set_perm)
sqla.event.listen(Database, 'after_update', set_perm)


class DatabaseAccount(Model):
    """ORM object to store the account info of database"""
    __tablename__ = 'database_account'
    type = "table"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('ab_user.id'))
    database_id = Column(Integer, ForeignKey('dbs.id'))
    username = Column(String(255))
    password = Column(EncryptedType(String(1024), config.get('SECRET_KEY')))

    @classmethod
    def insert_or_update_account(cls, user_id, db_id, username, password):
        record = (
            db.session.query(cls)
            .filter(cls.user_id == user_id,
                    cls.database_id == db_id)
            .first()
        )
        if record:
            record.username = username if username else record.username
            record.password = password if password else record.password
            db.session.commit()
        else:
            if not username or not password:
                logging.error("The username or password of database account can't be none.")
                return False
            new_record = cls(user_id=user_id,
                             database_id=db_id,
                             username=username,
                             password=password)
            db.session.add(new_record)
        db.session.commit()
        logging.info("Update username or password of user:{} and database:{} success."
                     .format(user_id, db_id))
        return True


class TableColumn(Model, AuditMixinNullable, ImportMixin):

    """ORM object for table columns, each table can have multiple columns"""

    __tablename__ = 'table_columns'
    id = Column(Integer, primary_key=True)
    table_id = Column(Integer, ForeignKey('tables.id'))
    table = relationship(
        'SqlaTable',
        backref=backref('ref_columns', cascade='all, delete-orphan'),
        foreign_keys=[table_id])
    column_name = Column(String(255))
    verbose_name = Column(String(1024))
    is_dttm = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    type = Column(String(32), default='')
    groupby = Column(Boolean, default=False)
    count_distinct = Column(Boolean, default=False)
    sum = Column(Boolean, default=False)
    avg = Column(Boolean, default=False)
    max = Column(Boolean, default=False)
    min = Column(Boolean, default=False)
    filterable = Column(Boolean, default=True)
    expression = Column(Text, default='')
    description = Column(Text, default='')
    python_date_format = Column(String(255))
    database_expression = Column(String(255))

    num_types = ('DOUBLE', 'FLOAT', 'INT', 'BIGINT', 'LONG')
    date_types = ('DATE', 'TIME')
    str_types = ('VARCHAR', 'STRING', 'CHAR')
    export_fields = (
        'table_id', 'column_name', 'verbose_name', 'is_dttm', 'is_active',
        'type', 'groupby', 'count_distinct', 'sum', 'avg', 'max', 'min',
        'filterable', 'expression', 'description', 'python_date_format',
        'database_expression'
    )

    def __repr__(self):
        return self.column_name

    @property
    def isnum(self):
        return any([t in self.type.upper() for t in self.num_types])

    @property
    def is_time(self):
        return any([t in self.type.upper() for t in self.date_types])

    @property
    def is_string(self):
        return any([t in self.type.upper() for t in self.str_types])

    @property
    def sqla_col(self):
        name = self.column_name
        if not self.expression:
            col = column(self.column_name).label(name)
        else:
            col = literal_column(self.expression).label(name)
        return col

    def get_time_filter(self, start_dttm, end_dttm):
        col = self.sqla_col.label('__time')
        return and_(
            col >= text(self.dttm_sql_literal(start_dttm)),
            col <= text(self.dttm_sql_literal(end_dttm)),
        )

    def get_timestamp_expression(self, time_grain):
        """Getting the time component of the query"""
        expr = self.expression or self.column_name
        if not self.expression and not time_grain:
            return column(expr, type_=DateTime).label(DTTM_ALIAS)
        if time_grain:
            pdf = self.python_date_format
            if pdf in ('epoch_s', 'epoch_ms'):
                # if epoch, translate to DATE using db specific conf
                db_spec = self.table.database.db_engine_spec
                if pdf == 'epoch_s':
                    expr = db_spec.epoch_to_dttm().format(col=expr)
                elif pdf == 'epoch_ms':
                    expr = db_spec.epoch_ms_to_dttm().format(col=expr)
            grain = self.table.database.grains_dict().get(time_grain, '{col}')
            expr = grain.function.format(col=expr)
        return literal_column(expr, type_=DateTime).label(DTTM_ALIAS)

    @classmethod
    def import_obj(cls, i_column):
        def lookup_obj(lookup_column):
            return db.session.query(TableColumn).filter(
                TableColumn.table_id == lookup_column.table_id,
                TableColumn.column_name == lookup_column.column_name).first()
        return import_util.import_simple_obj(db.session, i_column, lookup_obj)

    def dttm_sql_literal(self, dttm):
        """Convert datetime object to a SQL expression string

        If database_expression is empty, the internal dttm
        will be parsed as the string with the pattern that
        the user inputted (python_date_format)
        If database_expression is not empty, the internal dttm
        will be parsed as the sql sentence for the database to convert
        """

        tf = self.python_date_format or '%Y-%m-%d %H:%M:%S.%f'
        if self.database_expression:
            return self.database_expression.format(dttm.strftime('%Y-%m-%d %H:%M:%S'))
        elif tf == 'epoch_s':
            return str((dttm - datetime(1970, 1, 1)).total_seconds())
        elif tf == 'epoch_ms':
            return str((dttm - datetime(1970, 1, 1)).total_seconds() * 1000.0)
        else:
            s = self.table.database.db_engine_spec.convert_dttm(
                self.type, dttm)
            return s or "'{}'".format(dttm.strftime(tf))


class SqlMetric(Model, AuditMixinNullable, ImportMixin):

    """ORM object for metrics, each table can have multiple metrics"""

    __tablename__ = 'sql_metrics'
    id = Column(Integer, primary_key=True)
    metric_name = Column(String(512))
    verbose_name = Column(String(1024))
    metric_type = Column(String(32))
    table_id = Column(Integer, ForeignKey('tables.id'))
    table = relationship(
        'SqlaTable',
        backref=backref('ref_metrics', cascade='all, delete-orphan'),
        foreign_keys=[table_id])
    expression = Column(Text)
    description = Column(Text)
    is_restricted = Column(Boolean, default=False, nullable=True)
    d3format = Column(String(128))

    export_fields = (
        'metric_name', 'verbose_name', 'metric_type', 'table_id', 'expression',
        'description', 'is_restricted', 'd3format')

    def __repr__(self):
        return self.metric_name

    @property
    def sqla_col(self):
        name = self.metric_name
        return literal_column(self.expression).label(name)

    @property
    def perm(self):
        return (
            "{parent_name}.[{obj.metric_name}](id:{obj.id})"
        ).format(obj=self,
                 parent_name=self.table.full_name) if self.table else None

    @classmethod
    def import_obj(cls, i_metric):
        def lookup_obj(lookup_metric):
            return db.session.query(SqlMetric).filter(
                SqlMetric.table_id == lookup_metric.table_id,
                SqlMetric.metric_name == lookup_metric.metric_name).first()
        return import_util.import_simple_obj(db.session, i_metric, lookup_obj)


class SqlaTable(Model, Queryable, AuditMixinNullable, ImportMixin):

    """An ORM object for SqlAlchemy table references"""

    type = "table"

    __tablename__ = 'tables'
    id = Column(Integer, primary_key=True)
    table_name = Column(String(250))
    main_dttm_col = Column(String(250))
    description = Column(Text)
    default_endpoint = Column(Text)
    database_id = Column(Integer, ForeignKey('dbs.id'), nullable=False)
    is_featured = Column(Boolean, default=False)
    filter_select_enabled = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey('ab_user.id'))
    owner = relationship('User', backref='tables', foreign_keys=[user_id])
    database = relationship(
        'Database',
        backref=backref('tables', cascade='all, delete-orphan'),
        foreign_keys=[database_id])
    offset = Column(Integer, default=0)
    cache_timeout = Column(Integer)
    schema = Column(String(255))
    sql = Column(Text)
    params = Column(Text)
    perm = Column(String(1000))
    table_type = Column(String(250))

    baselink = "tablemodelview"
    column_cls = TableColumn
    metric_cls = SqlMetric
    temp_columns = []      # for creating slice with source table
    temp_metrics = []
    export_fields = (
        'table_name', 'main_dttm_col', 'description', 'default_endpoint',
        'database_id', 'is_featured', 'offset', 'cache_timeout', 'schema',
        'sql', 'params')

    __table_args__ = (
        sqla.UniqueConstraint(
            'database_id', 'schema', 'table_name',
            name='_customer_location_uc'),)

    table_type_dict = {
        'database': 'Database',
        'inceptor': 'Database',
        'mysql': 'Database',
        'hdfs': 'HDFS',
        'upload': 'UploadFile'
    }

    def __repr__(self):
        return self.name

    @property
    def backend(self):
        if self.table_type.lower() == 'database':
            return self.database.backend
        else:
            # TODO get hdfs backend
            return 'Unknown backend'

    @property
    def columns(self):
        return self.temp_columns if len(self.temp_columns) > 0 else self.ref_columns

    @property
    def metrics(self):
        return self.temp_metrics if len(self.temp_metrics) > 0 else self.ref_metrics

    @property
    def description_markeddown(self):
        return utils.markdown(self.description)

    @property
    def link(self):
        name = escape(self.name)
        return Markup(
            '<a href="{self.explore_url}">{name}</a>'.format(**locals()))

    @property
    def schema_perm(self):
        """Returns schema permission if present, database one otherwise."""
        return utils.get_schema_perm(self.database, self.schema)

    def get_perm(self):
        return (
            "[{obj.database}].[{obj.table_name}]"
            "(id:{obj.id})").format(obj=self)

    @property
    def name(self):
        if not self.schema:
            return self.table_name
        return "{}.{}".format(self.schema, self.table_name)

    @property
    def full_name(self):
        return utils.get_datasource_full_name(
            self.database, self.table_name, schema=self.schema)

    @property
    def dttm_cols(self):
        l = [c.column_name for c in self.columns if c.is_dttm]
        if self.main_dttm_col not in l:
            l.append(self.main_dttm_col)
        return l

    @property
    def num_cols(self):
        return [c.column_name for c in self.columns if c.isnum]

    @property
    def any_dttm_col(self):
        cols = self.dttm_cols
        if cols:
            return cols[0]

    @property
    def html(self):
        t = ((c.column_name, c.type) for c in self.columns)
        df = pd.DataFrame(t)
        df.columns = ['field', 'type']
        return df.to_html(
            index=False,
            classes=(
                "dataframe table table-striped table-bordered "
                "table-condensed"))

    @property
    def metrics_combo(self):
        return sorted(
            [
                (m.metric_name, m.verbose_name or m.metric_name)
                for m in self.metrics],
            key=lambda x: x[1])

    @property
    def sql_url(self):
        return self.database.sql_url + "?table_name=" + str(self.table_name)

    @property
    def time_column_grains(self):
        return {
            "time_columns": self.dttm_cols,
            "time_grains": [grain.name for grain in self.database.grains()]
        }

    def get_col(self, col_name):
        columns = self.columns
        for col in columns:
            if col_name == col.column_name:
                return col

    def preview_data(self, limit=100):
        sql = "SELECT * FROM {} LIMIT {}".format(self.name, limit)
        engine = self.database.get_sqla_engine()
        return pd.read_sql_query(
            sql=sql,
            con=engine
        )

    def values_for_column(self,
                          column_name,
                          from_dttm,
                          to_dttm,
                          limit=500):
        """Runs query against sqla to retrieve some
        sample values for the given column.
        """
        granularity = self.main_dttm_col

        cols = {col.column_name: col for col in self.columns}
        target_col = cols[column_name]

        tbl = table(self.table_name)
        qry = select([target_col.sqla_col])
        qry = qry.select_from(tbl)
        qry = qry.distinct(column_name)
        qry = qry.limit(limit)

        if granularity:
            dttm_col = cols[granularity]
            timestamp = dttm_col.sqla_col.label('timestamp')
            time_filter = [
                timestamp >= text(dttm_col.dttm_sql_literal(from_dttm)),
                timestamp <= text(dttm_col.dttm_sql_literal(to_dttm)),
            ]
            qry = qry.where(and_(*time_filter))

        engine = self.database.get_sqla_engine()
        sql = "{}".format(
            qry.compile(
                engine, compile_kwargs={"literal_binds": True}, ),
        )

        return pd.read_sql_query(
            sql=sql,
            con=engine
        )

    def query(  # sqla
            self, groupby, metrics,
            granularity,
            from_dttm, to_dttm,
            filter=None,  # noqa
            is_timeseries=True,
            timeseries_limit=15,
            timeseries_limit_metric=None,
            row_limit=None,
            inner_from_dttm=None,
            inner_to_dttm=None,
            orderby=None,
            extras=None,
            columns=None):
        """Querying any sqla table from this common interface"""
        template_processor = get_template_processor(
            table=self, database=self.database)

        # For backward compatibility
        if granularity not in self.dttm_cols:
            granularity = self.main_dttm_col

        cols = {col.column_name: col for col in self.columns}
        metrics_dict = {m.metric_name: m for m in self.metrics}
        qry_start_dttm = datetime.now()

        if not granularity and is_timeseries:
            raise Exception(_(
                "Datetime column not provided as part table configuration "
                "and is required by this type of chart"))
        for m in metrics:
            if m not in metrics_dict:
                raise Exception(_("Metric '{}' is not valid".format(m)))
        metrics_exprs = [metrics_dict.get(m).sqla_col for m in metrics]
        timeseries_limit_metric = metrics_dict.get(timeseries_limit_metric)
        timeseries_limit_metric_expr = None
        if timeseries_limit_metric:
            timeseries_limit_metric_expr = \
                timeseries_limit_metric.sqla_col
        if metrics:
            main_metric_expr = metrics_exprs[0]
        else:
            main_metric_expr = literal_column("COUNT(*)").label("ccount")

        select_exprs = []
        groupby_exprs = []

        if groupby:
            select_exprs = []
            inner_select_exprs = []
            inner_groupby_exprs = []
            for s in groupby:
                col = cols[s]
                outer = col.sqla_col
                inner = col.sqla_col.label(col.column_name + '__')

                groupby_exprs.append(outer)
                select_exprs.append(outer)
                inner_groupby_exprs.append(inner)
                inner_select_exprs.append(inner)
        elif columns:
            for s in columns:
                select_exprs.append(cols[s].sqla_col)
            metrics_exprs = []

        if granularity:

            @compiles(ColumnClause)
            def visit_column(element, compiler, **kw):
                """Patch for sqlalchemy bug

                TODO: sqlalchemy 1.2 release should be doing this on its own.
                Patch only if the column clause is specific for DateTime
                set and granularity is selected.
                """
                text = compiler.visit_column(element, **kw)
                try:
                    if (
                            element.is_literal and
                            hasattr(element.type, 'python_type') and
                            type(element.type) is DateTime
                    ):
                        text = text.replace('%%', '%')
                except NotImplementedError:
                    # Some elements raise NotImplementedError for python_type
                    pass
                return text

            dttm_col = cols[granularity]
            time_grain = extras.get('time_grain_sqla')

            if is_timeseries:
                timestamp = dttm_col.get_timestamp_expression(time_grain)
                select_exprs += [timestamp]
                groupby_exprs += [timestamp]

            time_filter = dttm_col.get_time_filter(from_dttm, to_dttm)

        select_exprs += metrics_exprs
        qry = select(select_exprs)

        tbl = table(self.table_name)
        if self.schema:
            tbl.schema = self.schema

        # Supporting arbitrary SQL statements in place of tables
        if self.sql:
            tbl = TextAsFrom(sqla.text(self.sql), []).alias('expr_qry')

        if not columns:
            qry = qry.group_by(*groupby_exprs)

        where_clause_and = []
        having_clause_and = []
        for col, op, eq in filter:
            col_obj = cols[col]
            if op in ('in', 'not in'):
                splitted = FillterPattern.split(eq)[1::2]
                values = [types.replace("'", '').strip() for types in splitted]
                cond = col_obj.sqla_col.in_(values)
                if op == 'not in':
                    cond = ~cond
                where_clause_and.append(cond)
        if extras:
            where = extras.get('where')
            if where:
                where_clause_and += [wrap_clause_in_parens(
                    template_processor.process_template(where))]
            having = extras.get('having')
            if having:
                having_clause_and += [wrap_clause_in_parens(
                    template_processor.process_template(having))]
        if granularity:
            qry = qry.where(and_(*([time_filter] + where_clause_and)))
        else:
            qry = qry.where(and_(*where_clause_and))
        qry = qry.having(and_(*having_clause_and))
        if groupby:
            qry = qry.order_by(desc(main_metric_expr))
        elif orderby:
            for col, ascending in orderby:
                direction = asc if ascending else desc
                qry = qry.order_by(direction(col))

        qry = qry.limit(row_limit)

        if is_timeseries and timeseries_limit and groupby:
            # some sql dialects require for order by expressions
            # to also be in the select clause
            inner_select_exprs += [main_metric_expr]
            subq = select(inner_select_exprs)
            subq = subq.select_from(tbl)
            inner_time_filter = dttm_col.get_time_filter(
                inner_from_dttm or from_dttm,
                inner_to_dttm or to_dttm,
            )
            subq = subq.where(and_(*(where_clause_and + [inner_time_filter])))
            subq = subq.group_by(*inner_groupby_exprs)
            ob = main_metric_expr
            if timeseries_limit_metric_expr is not None:
                ob = timeseries_limit_metric_expr
            subq = subq.order_by(desc(ob))
            subq = subq.limit(timeseries_limit)
            on_clause = []
            for i, gb in enumerate(groupby):
                on_clause.append(
                    groupby_exprs[i] == column(gb + '__'))

            tbl = tbl.join(subq.alias(), and_(*on_clause))

        qry = qry.select_from(tbl)

        engine = self.database.get_sqla_engine()
        sql = "{}".format(
            qry.compile(
                engine, compile_kwargs={"literal_binds": True},),
        )
        sql = sqlparse.format(sql, reindent=True)
        status = QueryStatus.SUCCESS
        error_message = None
        df = None
        try:
            df = pd.read_sql_query(sql, con=engine)
        except Exception as e:
            status = QueryStatus.FAILED
            error_message = str(e)

        return QueryResult(
            status=status,
            df=df,
            duration=datetime.now() - qry_start_dttm,
            query=sql,
            error_message=error_message)

    def get_sqla_table_object(self):
        return self.database.get_table(self.table_name, schema=self.schema)

    def set_temp_columns_and_metrics(self):
        """Get table's columns and metrics"""
        try:
            table = self.get_sqla_table_object()
        except Exception:
            raise Exception(
                "Table doesn't seem to exist in the specified database, "
                "couldn't fetch column information")

        any_date_col = None
        self.temp_columns = []
        self.temp_metrics = []
        for col in table.columns:
            try:
                datatype = "{}".format(col.type).upper()
            except Exception as e:
                datatype = "UNKNOWN"
                logging.error(
                    "Unrecognized data type in {}.{}".format(table, col.name))
                logging.exception(e)

            new_col = TableColumn()
            new_col.column_name = col.name
            new_col.type = datatype
            new_col.groupby = new_col.is_string
            new_col.filterable = new_col.is_string
            new_col.sum = new_col.isnum
            new_col.avg = new_col.isnum
            new_col.is_dttm = new_col.is_time
            self.temp_columns.append(new_col)

            if not any_date_col and new_col.is_time:
                any_date_col = col.name

            quoted = "{}".format(
                column(new_col.column_name).compile(dialect=db.engine.dialect))
            if new_col.sum:
                new_metric = SqlMetric()
                new_metric.metric_name = 'sum__' + new_col.column_name
                new_metric.verbose_name = 'sum__' + new_col.column_name
                new_metric.metric_type = 'sum'
                new_metric.expression = "SUM({})".format(quoted)
                self.temp_metrics.append(new_metric)
            if new_col.avg:
                new_metric = SqlMetric()
                new_metric.metric_name = 'avg__' + new_col.column_name
                new_metric.verbose_name = 'avg__' + new_col.column_name
                new_metric.metric_type = 'avg'
                new_metric.expression = "AVG({})".format(quoted)
                self.temp_metrics.append(new_metric)
            if new_col.max:
                new_metric = SqlMetric()
                new_metric.metric_name = 'max__' + new_col.column_name
                new_metric.verbose_name = 'max__' + new_col.column_name
                new_metric.metric_type = 'max'
                new_metric.expression = "MAX({})".format(quoted)
                self.temp_metrics.append(new_metric)
            if new_col.min:
                new_metric = SqlMetric()
                new_metric.metric_name = 'min__' + new_col.column_name
                new_metric.verbose_name = 'min__' + new_col.column_name
                new_metric.metric_type = 'min'
                new_metric.expression = "MIN({})".format(quoted)
                self.temp_metrics.append(new_metric)
            if new_col.count_distinct:
                new_metric = SqlMetric()
                new_metric.metric_name = 'count_distinct__' + new_col.column_name
                new_metric.verbose_name = 'count_distinct__' + new_col.column_name
                new_metric.metric_type = 'count_distinct'
                new_metric.expression = "COUNT(DISTINCT {})".format(quoted)
                self.temp_metrics.append(new_metric)

        new_metric = SqlMetric()
        new_metric.metric_name = 'count'
        new_metric.verbose_name = 'COUNT(*)'
        new_metric.metric_type = 'count'
        new_metric.expression = "COUNT(*)"
        self.temp_metrics.append(new_metric)
        if not self.main_dttm_col:
            self.main_dttm_col = any_date_col

    def fetch_metadata(self):
        """Fetches the metadata for the table and merges it in"""
        try:
            table = self.get_sqla_table_object()
        except Exception:
            raise Exception(
                "Table doesn't seem to exist in the specified database, "
                "couldn't fetch column information")

        TC = TableColumn  # noqa shortcut to class
        M = SqlMetric  # noqa
        metrics = []
        any_date_col = None
        for col in table.columns:
            try:
                datatype = "{}".format(col.type).upper()
            except Exception as e:
                datatype = "UNKNOWN"
                logging.error(
                    "Unrecognized data type in {}.{}".format(table, col.name))
                logging.exception(e)
            dbcol = (
                db.session
                .query(TC)
                .filter(TC.table == self)
                .filter(TC.column_name == col.name)
                .first()
            )
            db.session.flush()
            if not dbcol:
                dbcol = TableColumn(column_name=col.name, type=datatype)
                dbcol.groupby = dbcol.is_string
                dbcol.filterable = dbcol.is_string
                dbcol.sum = dbcol.isnum
                dbcol.avg = dbcol.isnum
                dbcol.is_dttm = dbcol.is_time

            db.session.merge(self)
            self.columns.append(dbcol)

            if not any_date_col and dbcol.is_time:
                any_date_col = col.name

            quoted = "{}".format(
                column(dbcol.column_name).compile(dialect=db.engine.dialect))
            if dbcol.sum:
                metrics.append(M(
                    metric_name='sum__' + dbcol.column_name,
                    verbose_name='sum__' + dbcol.column_name,
                    metric_type='sum',
                    expression="SUM({})".format(quoted)
                ))
            if dbcol.avg:
                metrics.append(M(
                    metric_name='avg__' + dbcol.column_name,
                    verbose_name='avg__' + dbcol.column_name,
                    metric_type='avg',
                    expression="AVG({})".format(quoted)
                ))
            if dbcol.max:
                metrics.append(M(
                    metric_name='max__' + dbcol.column_name,
                    verbose_name='max__' + dbcol.column_name,
                    metric_type='max',
                    expression="MAX({})".format(quoted)
                ))
            if dbcol.min:
                metrics.append(M(
                    metric_name='min__' + dbcol.column_name,
                    verbose_name='min__' + dbcol.column_name,
                    metric_type='min',
                    expression="MIN({})".format(quoted)
                ))
            if dbcol.count_distinct:
                metrics.append(M(
                    metric_name='count_distinct__' + dbcol.column_name,
                    verbose_name='count_distinct__' + dbcol.column_name,
                    metric_type='count_distinct',
                    expression="COUNT(DISTINCT {})".format(quoted)
                ))
            dbcol.type = datatype
            db.session.merge(self)
            db.session.commit()

        metrics.append(M(
            metric_name='count',
            verbose_name='COUNT(*)',
            metric_type='count',
            expression="COUNT(*)"
        ))
        for metric in metrics:
            m = (
                db.session.query(M)
                .filter(M.metric_name == metric.metric_name)
                .filter(M.table_id == self.id)
                .first()
            )
            metric.table_id = self.id
            if not m:
                db.session.add(metric)
                db.session.commit()
        if not self.main_dttm_col:
            self.main_dttm_col = any_date_col

    @classmethod
    def import_obj(cls, i_datasource, import_time=None):
        """Imports the datasource from the object to the database.

         Metrics and columns and datasource will be overrided if exists.
         This function can be used to import/export dashboards between multiple
         superset instances. Audit metadata isn't copies over.
        """
        def lookup_sqlatable(table):
            return db.session.query(SqlaTable).join(Database).filter(
                SqlaTable.table_name == table.table_name,
                SqlaTable.schema == table.schema,
                Database.id == table.database_id,
            ).first()

        def lookup_database(table):
            return db.session.query(Database).filter_by(
                database_name=table.params_dict['database_name']).one()
        return import_util.import_datasource(
            db.session, i_datasource, lookup_database, lookup_sqlatable,
            import_time)

sqla.event.listen(SqlaTable, 'after_insert', set_perm)
sqla.event.listen(SqlaTable, 'after_update', set_perm)


class Log(Model):

    """ORM object used to log Superset actions to the database"""

    __tablename__ = 'logs'

    id = Column(Integer, primary_key=True)
    action = Column(String(512))
    action_type = Column(String(200))
    obj_type = Column(String(50))
    obj_id = Column(Integer)
    user_id = Column(Integer, ForeignKey('ab_user.id'))
    json = Column(Text)
    user = relationship('User', backref='logs', foreign_keys=[user_id])
    dttm = Column(DateTime, default=datetime.now)
    dt = Column(Date, default=date.today())
    duration_ms = Column(Integer)
    referrer = Column(String(1024))

    @classmethod
    def log_this(cls, action_str, obj=None, obj_id=None):
        """Decorator to log user actions"""
        def _log_this(f):
            @functools.wraps(f)
            def wrapper(*args, **kwargs):
                start_dttm = datetime.now()
                user_id = None
                if g.user:
                    user_id = g.user.get_id()
                d = request.args.to_dict()
                post_data = request.form or {}
                d.update(post_data)
                d.update(kwargs)
                slice_id = d.get('slice_id', None)
                try:
                    slice_id = int(slice_id) if slice_id else None
                except ValueError:
                    slice_id = None
                params = ""
                try:
                    params = json.dumps(d)
                except:
                    pass
                value = f(*args, **kwargs)

                sesh = db.session()
                log = cls(
                    action=action_str or f.__name__,
                    json=params,
                    dashboard_id=d.get('dashboard_id') or None,
                    slice_id=slice_id,
                    duration_ms=(datetime.now() - start_dttm).total_seconds() * 1000,
                    referrer=request.referrer[:1000] if request.referrer else None,
                    user_id=user_id)
                sesh.add(log)
                sesh.commit()
                return value
            return wrapper
        return _log_this

    @classmethod
    def log_action(cls, action_type, action, obj_type, obj_id):
        d = request.args.to_dict()
        post_data = request.form or {}
        d.update(post_data)
        params = ""
        try:
            params = json.dumps(d)
        except:
            pass
        sesh = db.session()
        log = cls(
            action=action,
            action_type=action_type,
            obj_type=obj_type,
            obj_id=obj_id,
            json=params,
            referrer=request.referrer[:1000] if request.referrer else None,
            user_id=g.user.get_id() if g.user else None)
        sesh.add(log)
        sesh.commit()


class FavStar(Model):
    __tablename__ = 'favstar'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('ab_user.id'))
    class_name = Column(String(50))
    obj_id = Column(Integer)
    dttm = Column(DateTime, default=datetime.utcnow)


class Query(Model):

    """ORM model for SQL query"""

    __tablename__ = 'query'
    id = Column(Integer, primary_key=True)
    client_id = Column(String(11), unique=True, nullable=False)

    database_id = Column(Integer, ForeignKey('dbs.id'), nullable=False)

    # Store the tmp table into the DB only if the user asks for it.
    tmp_table_name = Column(String(256))
    user_id = Column(
        Integer, ForeignKey('ab_user.id'), nullable=True)
    status = Column(String(16), default=QueryStatus.PENDING)
    tab_name = Column(String(256))
    sql_editor_id = Column(String(256))
    schema = Column(String(256))
    sql = Column(Text)
    # Query to retrieve the results,
    # used only in case of select_as_cta_used is true.
    select_sql = Column(Text)
    executed_sql = Column(Text)
    # Could be configured in the superset config.
    limit = Column(Integer)
    limit_used = Column(Boolean, default=False)
    limit_reached = Column(Boolean, default=False)
    select_as_cta = Column(Boolean)
    select_as_cta_used = Column(Boolean, default=False)

    progress = Column(Integer, default=0)  # 1..100
    # # of rows in the result set or rows modified.
    rows = Column(Integer)
    error_message = Column(Text)
    # key used to store the results in the results backend
    results_key = Column(String(64))

    # Using Numeric in place of DateTime for sub-second precision
    # stored as seconds since epoch, allowing for milliseconds
    start_time = Column(Numeric(precision=3))
    end_time = Column(Numeric(precision=3))
    changed_on = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)

    database = relationship(
        'Database',
        foreign_keys=[database_id],
        backref=backref('queries', cascade='all, delete-orphan')
    )
    user = relationship(
        'User',
        backref=backref('queries', cascade='all, delete-orphan'),
        foreign_keys=[user_id])

    __table_args__ = (
        sqla.Index('ti_user_id_changed_on', user_id, changed_on),
    )

    @property
    def limit_reached(self):
        return self.rows == self.limit if self.limit_used else False

    def to_dict(self):
        return {
            'changedOn': self.changed_on,
            'changed_on': self.changed_on.isoformat(),
            'dbId': self.database_id,
            'db': self.database.database_name,
            'endDttm': self.end_time,
            'errorMessage': self.error_message,
            'executedSql': self.executed_sql,
            'id': self.client_id,
            'limit': self.limit,
            'progress': self.progress,
            'rows': self.rows,
            'schema': self.schema,
            'ctas': self.select_as_cta,
            'serverId': self.id,
            'sql': self.sql,
            'sqlEditorId': self.sql_editor_id,
            'startDttm': self.start_time,
            'state': self.status.lower(),
            'tab': self.tab_name,
            'tempTable': self.tmp_table_name,
            'userId': self.user_id,
            'user': self.user.username,
            'limit_reached': self.limit_reached,
            'resultsKey': self.results_key,
        }

    @property
    def name(self):
        ts = datetime.now().isoformat()
        ts = ts.replace('-', '').replace(':', '').split('.')[0]
        tab = self.tab_name.replace(' ', '_').lower() if self.tab_name else 'notab'
        tab = re.sub(r'\W+', '', tab)
        return "sqllab_{tab}_{ts}".format(**locals())


class DatasourceAccessRequest(Model, AuditMixinNullable):
    """ORM model for the access requests for datasources and dbs."""
    __tablename__ = 'access_request'
    id = Column(Integer, primary_key=True)

    datasource_id = Column(Integer)
    datasource_type = Column(String(200))

    ROLES_BLACKLIST = set(config.get('ROBOT_PERMISSION_ROLES', []))

    @property
    def cls_model(self):
        return SourceRegistry.sources[self.datasource_type]

    @property
    def username(self):
        return self.creator()

    @property
    def datasource(self):
        return self.get_datasource

    @datasource.getter
    @utils.memoized
    def get_datasource(self):
        ds = db.session.query(self.cls_model).filter_by(
            id=self.datasource_id).first()
        return ds

    @property
    def datasource_link(self):
        return self.datasource.link

    @property
    def roles_with_datasource(self):
        action_list = ''
        pv = sm.find_permission_view_menu(
            'datasource_access', self.datasource.perm)
        for r in pv.role:
            if r.name in self.ROLES_BLACKLIST:
                continue
            url = (
                '/superset/approve?datasource_type={self.datasource_type}&'
                'datasource_id={self.datasource_id}&'
                'created_by={self.created_by.username}&role_to_grant={r.name}'
                .format(**locals())
            )
            href = '<a href="{}">Grant {} Role</a>'.format(url, r.name)
            action_list = action_list + '<li>' + href + '</li>'
        return '<ul>' + action_list + '</ul>'

    @property
    def user_roles(self):
        action_list = ''
        for r in self.created_by.roles:
            url = (
                '/superset/approve?datasource_type={self.datasource_type}&'
                'datasource_id={self.datasource_id}&'
                'created_by={self.created_by.username}&role_to_extend={r.name}'
                .format(**locals())
            )
            href = '<a href="{}">Extend {} Role</a>'.format(url, r.name)
            if r.name in self.ROLES_BLACKLIST:
                href = "{} Role".format(r.name)
            action_list = action_list + '<li>' + href + '</li>'
        return '<ul>' + action_list + '</ul>'


str_to_model = {
    'slice': Slice,
    'dashboard': Dashboard,
    'table': SqlaTable,
    'database': Database
}


class DailyNumber(Model):
    """ORM object used to log the daily number of Superset objects
    'user_id = -1' means all user's number
    """
    __tablename__ = 'daily_number'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('ab_user.id'))
    obj_type = Column(String(32), nullable=False)
    count = Column(Integer, nullable=False)
    dt = Column(Date, default=date.today())

    all_obj_type = ['slice', 'dashboard', 'table', 'database']

    def __str__(self):
        return '{} {}s on {}'.format(self.count, self.type, self.dt)

    @classmethod
    def log_number(cls, obj_type, user_id):
        try:
            obj_model = str_to_model[obj_type.lower()]
        except KeyError as e:
            logging.error("Unrecognized object type in {}".format(obj_type.lower()))
            logging.exception(e)
            return 0

        user_id = int(user_id)
        today_count = 0
        if user_id > 0:
            # object number of present user or is_online
            if hasattr(obj_model, 'online'):
                today_count = (
                    db.session.query(obj_model)
                    .filter(
                        or_(
                            obj_model.created_by_fk == user_id,
                            obj_model.online == 1
                        )
                    )
                    .count())
            else:
                today_count = (
                    db.session.query(obj_model)
                    .filter(obj_model.created_by_fk == user_id)
                    .count()
                )
        elif user_id == 0:
            today_count = db.session.query(obj_model).count()
        else:
            logging.error("Error user_id value: {} passed to {}"
                          .format(obj_type.lower(), 'log_number()'))
            return 0

        today_record = (
            db.session.query(cls)
            .filter(
                and_(
                    cls.obj_type.ilike(obj_type),
                    cls.dt == date.today(),
                    cls.user_id == user_id
                )
            )
            .first()
        )
        if today_record:
            today_record.count = today_count
        else:
            new_record = cls(
                obj_type=obj_type.lower(),
                user_id=user_id,
                count=today_count,
                dt=date.today()
            )
            db.session.add(new_record)
        db.session.commit()
