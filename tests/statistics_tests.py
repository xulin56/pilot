from __future__ import absolute_import

import unittest
from superset import db, models, statistics as stat


class StatisticsTests(unittest.TestCase):
    """Testings for Sql Lab"""
    def __init__(self, *args, **kwargs):
        super(StatisticsTests, self).__init__(*args, **kwargs)

    def tearDown(self):
        db.session.query(models.Query).delete()
        db.session.commit()

    def test_count(self):
        print(stat.get_connections_count())
        print(stat.get_tables_count())
        print(stat.get_dashboards_count())
        print(stat.get_slices_count())

    def test_get_fav_dashboards(self):
        stat.get_fav_dashboards()

    def test_get_fav_slices(self):
        stat.get_fav_slices()

    def test_get_table_used(self):
        stat.get_table_used()

    def test_get_slice_types(self):
        stat.get_slice_types()

    def test_get_dashboard_actions(self):
        stat.get_dashboard_actions()

    def test_get_slice_actions(self):
        stat.get_slice_actions()

    def test_get_user_actions(self):
        stat.get_user_actions()

if __name__ == '__main__':
    unittest.main()
