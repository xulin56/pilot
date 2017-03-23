import os
import unittest
import pandas as pd
import ast
from dateutil import parser
import datetime
from sqlalchemy import types
from superset import db
from hdfs.client import Client


class StatisticsTests(unittest.TestCase):
    """Testings for Sql Lab"""
    folder = '~/project/superset/read_files'
    xls_path = os.path.join(folder, 'birth_names.xls')
    xlsx_path = os.path.join(folder, 'birth_names.xlsx')
    csv_path = os.path.join(folder, 'birth_names.csv')
    txt_path = os.path.join(folder, 'birth_names.txt')

    def __init__(self, *args, **kwargs):
        super(StatisticsTests, self).__init__(*args, **kwargs)

    def test_read_csv_to_sql(self, csv_path):
        sep = ','
        header = 0
        names = ['country', 'name', 'sex', 'num', 'year', 'boy_num', 'girl_num']
        parse_dates = [4]
        usecols = [0, 1, 2, 3, 4, 5, 6]
        df = pd.read_csv(csv_path, sep=sep, header=header,
                           parse_dates=parse_dates, usecols=usecols)
        # print(df.dtypes)
        # print(list(df))
        # dtype = {'country': types.TEXT, 'name': types.TEXT, 'sex': types.TEXT,
        #          'num': types.Integer, 'year': types.DateTime, 'boy_num': types.Integer,
        #          'girl_num': types.Integer}
        df.to_sql('birth_names_csv', db.engine.connect(), schema='superset2',
                  if_exists='replace', chunksize=10000)

    def test_read_excel_to_sql(self, xls_path):
        sheetname = 0
        header = None
        names = ['country', 'name', 'sex', 'num', 'year', 'boy_num', 'girl_num']
        parse_cols = [0, 1, 2, 3, 4, 5, 6]
        xlsx = pd.ExcelFile(xls_path)
        df = pd.read_excel(xlsx, sheetname=sheetname, header=header,
                           names=names, parse_cols=parse_cols)
        df.to_sql('birth_names_xls', db.engine.connect(), schema='superset2',
                  if_exists='replace', chunksize=10000)

    def test_read_txt_to_sql(self, txt_path):
        sep = ','
        header = 0
        names = ['country', 'name', 'sex', 'num', 'year', 'boy_num', 'girl_num']
        parse_dates = [4]
        usecols = [0, 1, 2, 3, 4, 5, 6]
        df = pd.read_table(txt_path, sep=sep, header=header,
                         parse_dates=parse_dates, usecols=usecols)
        df.to_sql('birth_names_txt', db.engine.connect(), schema='superset2',
                  if_exists='replace', chunksize=10000)

    def test_hdfs(self):
        client = Client('http://172.16.2.41:50070', proxy='hive', root='/')
        print(client.list('/tmp/jiajie'))
        with client.read('/tmp/jiajie/birth_names.txt', length=10) as reader:
            data = reader.read()


if __name__ == '__main__':
    unittest.main()
