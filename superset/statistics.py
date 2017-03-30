"""Private statistics info"""
import json
from flask import g
from superset import db
from superset.models import Database, SqlaTable, Slice, Dashboard, FavStar, Log
from sqlalchemy import func, and_
from flask_appbuilder.security.sqla.models import User


def get_connections_count():
    return db.session.query(Database).count()


def get_tables_count():
    return db.session.query(SqlaTable).count()


def get_dashboards_count():
    return db.session.query(Dashboard).count()


def get_slices_count():
    return db.session.query(Slice).count()


def get_slice_types():
    """Query the viz_type of slices"""
    rs = db.session.query(func.count(Slice.viz_type), Slice.viz_type) \
        .group_by(Slice.viz_type) \
        .order_by(func.count(Slice.viz_type).desc()) \
        .all()
    for row in rs:
        print(row)


def get_fav_dashboards(limit=10, all_user=True):
    """Query the times of dashboard liked by users"""
    if all_user:
        rs = (
            db.session.query(func.count(FavStar.obj_id), Dashboard.dashboard_title)
            .filter(
                and_(FavStar.class_name == 'Dashboard',
                     FavStar.obj_id == Dashboard.id)
            )
            .group_by(FavStar.obj_id)
            .order_by(func.count(FavStar.obj_id).desc())
            .limit(limit)
            .all()
        )
    else:
        rs = (
            db.session.query(func.count(FavStar.obj_id), Dashboard.dashboard_title)
            .filter(
                and_(FavStar.user_id == g.user.get_id(),
                     FavStar.class_name == 'Dashboard',
                     FavStar.obj_id == Dashboard.id)
            )
            .group_by(FavStar.obj_id)
            .order_by(func.count(FavStar.obj_id).desc())
            .limit(limit)
            .all()
        )
    return json.dumps(rs)


def get_fav_slices(limit=10, all_user=True):
    """Query the times of slice liked by users"""
    if all_user:
        rs = (
            db.session.query(func.count(FavStar.obj_id), Slice.slice_name)
            .filter(
                and_(FavStar.class_name == 'Slice',
                     FavStar.obj_id == Slice.id)
            )
            .group_by(FavStar.obj_id)
            .order_by(func.count(FavStar.obj_id).desc())
            .limit(limit)
            .all()
        )
    else:
        rs = (
            db.session.query(func.count(FavStar.obj_id), Dashboard.dashboard_title)
            .filter(
                and_(FavStar.user_id == g.user.get_id(),
                     FavStar.class_name == 'Dashboard',
                     FavStar.obj_id == Dashboard.id)
            )
            .group_by(FavStar.obj_id)
            .order_by(func.count(FavStar.obj_id).desc())
            .limit(limit)
            .all()
        )
    return json.dumps(rs)


def get_table_used():
    """Query the times of table used by slices"""
    rs = db.session.query(func.count(Slice.datasource_id), SqlaTable.table_name) \
        .filter(Slice.datasource_type == 'table') \
        .filter(Slice.datasource_id == SqlaTable.id) \
        .group_by(Slice.datasource_id) \
        .order_by(func.count(Slice.datasource_id).desc()) \
        .limit(10) \
        .all()
    for row in rs:
        print(row)


def get_dashboard_actions():
    """The records of dashboards be modified"""
    # TODO if use Guardian, no table:'ab_user', use 'username' replace 'changed_by_fk'
    rs = db.session.query(Dashboard.dashboard_title, User.username, Dashboard.changed_on) \
        .filter(Dashboard.changed_by_fk == User.id) \
        .order_by(Dashboard.changed_on.desc()) \
        .limit(10).\
        all()
    for row in rs:
        print(row)


def get_slice_actions():
    """The records of slices be modified"""
    # TODO if use Guardian, no table:'ab_user', use 'username' replace 'changed_by_fk'
    rs = db.session.query(Slice.slice_name, User.username, Slice.changed_on) \
        .filter(Slice.changed_by_fk == User.id) \
        .order_by(Slice.changed_on.desc()) \
        .limit(10)\
        .all()
    for row in rs:
        print(row)


def get_user_actions():
    """The records of user"""
    # TODO if use Guardian, no table:'ab_user', delete column:'user_id'
    rs = db.session.query(User.username, Log.action, Log.dttm) \
        .filter(Log.user_id == User.id) \
        .order_by(Log.dttm.desc()) \
        .limit(10).\
        all()
    for row in rs:
        print(row)


