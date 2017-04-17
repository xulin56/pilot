from __future__ import absolute_import

import unittest
from superset import db, models
from superset.views import Home


class HomeTests(unittest.TestCase):
    """Testings for Sql Lab"""
    def __init__(self, *args, **kwargs):
        super(HomeTests, self).__init__(*args, **kwargs)
        self.home = Home()

    def tearDown(self):
        db.session.query(models.Query).delete()
        db.session.commit()

    def test_get_object_counts(self):
        objs = ['slice', 'dashboard', 'table', 'database']
        print(self.home.get_object_counts(objs))

    def test_log_number(self):
        from superset.models import DailyNumber
        DailyNumber.log_number('slice')
        # DailyNumber.log_number('dashboard')
        # DailyNumber.log_number('table')
        # DailyNumber.log_number('database')

    def test_get_object_number_trend(self):
        objs = ['slice', 'dashboard', 'table', 'database']
        obj = objs[1]
        response = self.home.get_object_number_trend(obj)
        print('{}: {}'.format(obj, response))

    def test_get_object_number_trends(self):
        objs = ['slice', 'dashboard', 'table', 'database']
        response = self.home.get_object_number_trends(objs)
        print(response)

    def test_get_fav_dashboards(self):
        response = self.home.get_fav_dashboards(limit=10, all_user=True)
        print(response)

    def test_get_fav_slices(self):
        response = self.home.get_fav_slices(limit=10, all_user=True)
        print(response)

    def test_get_table_used(self):
        response = self.home.get_table_used(limit=5)
        print(response)

    def test_get_slice_used(self):
        response = self.home.get_slice_used(limit=5)
        print(response)

    def test_get_slice_types(self):
        response = self.home.get_slice_types()
        print(response)

    def test_get_modified_dashboards(self):
        response = self.home.get_modified_dashboards()
        print(response)

    def test_get_modified_slices(self):
        response = self.home.get_modified_slices()
        print(response)

    def test_get_user_actions(self):
        response = self.home.get_user_actions(limit=3)
        print(response)


if __name__ == '__main__':
    unittest.main()
