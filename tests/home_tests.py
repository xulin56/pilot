from __future__ import absolute_import

import unittest
from superset import db, models
from superset.models import str_to_model
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
        types = ['dashboard', 'slice', 'table', 'database']
        response = self.home.get_object_counts(types, 0)
        print(response)

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
        response = self.home.get_fav_dashboards(2, limit=10)
        print(response)

    def test_get_fav_slices(self):
        response = self.home.get_fav_slices(1, limit=10)
        print(response)

    def test_get_refered_slices(self):
        response = self.home.get_refered_slices(1, limit=5)
        print(response)

    def test_get_slice_types(self):
        response = self.home.get_slice_types()
        print(response)

    def test_get_edited_objects(self):
        types = ['dashboard', 'slice']
        response = self.home.get_edited_objects(1, types, limit=5)
        print(response)

    def test_get_user_actions(self):
        types = ['release', 'downline']
        response = self.home.get_user_actions(types=types, limit=5)
        print(response)


if __name__ == '__main__':
    unittest.main()
