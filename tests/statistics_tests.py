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
        response = stat.get_fav_dashboards(limit=10, all_user=True)
        print(response)

    def test_get_fav_slices(self):
        response = stat.get_fav_slices(limit=10, all_user=True)
        print(response)

    def test_get_table_used(self):
        response = stat.get_table_used(limit=5)
        print(response)

    def test_get_slice_types(self):
        stat.get_slice_types()

    def test_get_modified_dashboards(self):
        response = stat.get_modified_dashboards()
        print(response)

    def test_get_modified_slices(self):
        response = stat.get_modified_slices()
        print(response)

    def test_get_user_actions(self):
        stat.get_user_actions()

if __name__ == '__main__':
    unittest.main()
