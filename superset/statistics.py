"""Private statistics info"""
import json
from collections import Counter
from datetime import date, timedelta
from flask import g
from superset import db
from superset.models import Database, SqlaTable, Slice, \
    Dashboard, FavStar, Log, DailyNumber
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


def get_slice_types(limit=10):
    """Query the viz_type of slices"""
    rs = (
        db.session.query(func.count(Slice.viz_type), Slice.viz_type)
        .group_by(Slice.viz_type)
        .order_by(func.count(Slice.viz_type).desc())
        .limit(limit)
        .all()
    )
    return json.dumps(rs)


def get_fav_dashboards(limit=10, all_user=True):
    """Query the times of dashboard liked by users"""
    if all_user:
        rs = (
            db.session.query(func.count(FavStar.obj_id), Dashboard.dashboard_title)
            .filter(
                and_(FavStar.class_name.ilike('dashboard'),
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
                     FavStar.class_name.ilike('dashboard'),
                     FavStar.obj_id == Dashboard.id)
            )
            .group_by(FavStar.obj_id)
            .order_by(func.count(FavStar.obj_id).desc())
            .limit(limit)
            .all()
        )
    if not rs:
        return json.dumps({})
    response = []
    for count, name in rs:
        response.append({'name': name, 'count': count})
    return json.dumps(response)


def get_fav_slices(limit=10, all_user=True):
    """Query the times of slice liked by users"""
    if all_user:
        rs = (
            db.session.query(func.count(FavStar.obj_id), Slice.slice_name)
            .filter(
                and_(FavStar.class_name.ilike('slice'),
                     FavStar.obj_id == Slice.id)
            )
            .group_by(FavStar.obj_id)
            .order_by(func.count(FavStar.obj_id).desc())
            .limit(limit)
            .all()
        )
    else:
        rs = (
            db.session.query(func.count(FavStar.obj_id), Slice.slice_name)
            .filter(
                and_(FavStar.user_id == g.user.get_id(),
                     FavStar.class_name.ilike('slice'),
                     FavStar.obj_id == Dashboard.id)
            )
            .group_by(FavStar.obj_id)
            .order_by(func.count(FavStar.obj_id).desc())
            .limit(limit)
            .all()
        )
    if not rs:
        return json.dumps({})
    response = []
    for count, name in rs:
        response.append({'name': name, 'count': count})
    return json.dumps(response)


def get_table_used(limit=10):
    """Query the times of table used by slices"""
    rs = (
        db.session.query(func.count(Slice.datasource_id), SqlaTable.table_name)
        .filter(
            and_(
                Slice.datasource_type == 'table',
                Slice.datasource_id == SqlaTable.id
            )
        )
        .group_by(Slice.datasource_id)
        .order_by(func.count(Slice.datasource_id).desc())
        .limit(limit)
        .all()
    )
    if not rs:
        return json.dumps({})
    response = []
    for count, name in rs:
        response.append({'name': name, 'count': count})
    return json.dumps(response)


def get_slice_used(limit=10):
    """Query the times of slice used by dashboards"""
    rs = db.session.query(Dashboard).all()
    slices = []
    for dash in rs:
        for s in dash.slices:
            slices.append(str(s))
    if not slices:
        return json.dumps({})

    top_n = Counter(slices).most_common(limit)
    response = []
    for s in top_n:
        response.append({'name': s[0], 'count': s[1]})
    return json.dumps(response)


def get_modified_dashboards(limit=10):
    """The records of dashboards be modified"""
    rs = (
        db.session.query(
            Dashboard.dashboard_title, User.username, Dashboard.changed_on)
        .filter(Dashboard.changed_by_fk == User.id)
        .order_by(Dashboard.changed_on.desc())
        .limit(limit)
        .all()
    )
    if not rs:
        return json.dumps({})
    response = []
    for title, user, dttm in rs:
        response.append({'name': title, 'user': user, 'time': str(dttm)})
    return json.dumps(response)


def get_modified_slices(limit=10):
    """The records of slices be modified"""
    rs = (
        db.session.query(Slice.slice_name, User.username, Slice.changed_on)
        .filter(Slice.changed_by_fk == User.id)
        .order_by(Slice.changed_on.desc())
        .limit(limit)
        .all()
    )
    if not rs:
        return json.dumps({})
    response = []
    for name, user, dttm in rs:
        response.append({'name': name, 'user': user, 'time': str(dttm)})
    return json.dumps(response)


def get_user_actions(limit=10, all_user=True):
    """The actions of user"""
    if all_user:
        rs = (
            db.session.query(User.username, Log.action, Log.dttm)
            .filter(Log.user_id == User.id)
            .order_by(Log.dttm.desc())
            .limit(limit)
            .all()
        )
    else:
        rs = (
            db.session.query(User.username, Log.action, Log.dttm)
            .filter(
                and_(Log.user_id == g.user.get_id(),
                     Log.user_id == User.id)
            )
            .order_by(Log.dttm.desc())
            .limit(limit)
            .all()
        )
    response = []
    for name, action, dttm in rs:
        response.append({'user': name, 'action': action, 'time': str(dttm)})
    return json.dumps(response)


def get_object_number_trends(objs):
    if not objs:
        return json.dumps({})

    response = {}
    for obj in objs:
        r = get_object_number_trend(obj)
        response[obj.lower()] = r
    return json.dumps(response)


def get_object_number_trend(obj):
    rows = (
        db.session.query(DailyNumber.count, DailyNumber.dt)
        .filter(DailyNumber.obj_type.ilike(obj))
        .order_by(DailyNumber.dt)
        .all()
    )
    return fill_missing_date(rows)


def fill_missing_date(rows):
    """Fill the discontinuous date and count of number trend"""
    full_count, full_dt = [], []
    if not rows:
        return {}

    one_day = timedelta(days=1)
    for row in rows:
        if row.dt > date.today():
            return {}
        elif len(full_count) < 1:
            full_count.append(int(row.count))
            full_dt.append(row.dt)
        else:
            while full_dt[-1] + one_day < row.dt:
                full_count.append(full_count[-1])
                full_dt.append(full_dt[-1] + one_day)
            full_count.append(row.count)
            full_dt.append(row.dt)

    while full_dt[-1] < date.today():
        full_count.append(full_count[-1])
        full_dt.append(full_dt[-1] + one_day)

    full_dt = [str(d) for d in full_dt]
    js = []
    for index, v in enumerate(full_count):
        js.append({'date': full_dt[index], 'count': full_count[index]})
    return js
