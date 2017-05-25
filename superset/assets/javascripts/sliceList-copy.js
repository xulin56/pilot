import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Operate } from './components/Slice';
import { DashboardEdit, SliceEdit } from './components/popup';

import { Pagination, Table } from 'antd';
import 'antd/dist/antd.css';

const $ = window.$ = require('jquery');

const columns = [{
    title: '',
    dataIndex: 'favorite',
    key: 'favorite',
    width: '5%',
    render: (text, record) => (
        <div>
            <button class="btn btn-default">收藏</button>
        </div>
    )
}, {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    width: '30%'
}, {
    title: '图标类型',
    dataIndex: 'type',
    key: 'type',
    sorter: true,
    width: '10%'
}, {
    title: '数据集',
    dataIndex: 'set',
    key: 'set',
    sorter: true,
    width: '10%'
}, {
    title: '所有者',
    dataIndex: 'owner',
    key: 'owner',
    sorter: true,
    width: '10%'
}, {
    title: '发布状态',
    dataIndex: 'state',
    key: 'state',
    sorter: true,
    width: '10%'
}, {
    title: '最后修改时间',
    dataIndex: 'time',
    key: 'time',
    sorter: true,
    width: '10%'
}, {
    title: '操作',
    key: 'action',
    width: '15%',
    render: (text, record) => (
        <div>
            <button class="btn btn-default">编辑</button>&nbsp;
            <button class="btn btn-default">发布</button>&nbsp;
            <button class="btn btn-default">删除</button>
        </div>
    )
}];

const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User',    // Column configuration not to be checked
    })
};

var dataSource = [];

$(document).ready(function() {

    function getSliceList() {

        var url = getAbsUrl("/slicemodelview/listdata/");
        $.getJSON(url, function (data) {
            analysisData(data);
            console.log("data=", data);
        });
    }

    function renderTable() {

        render(<Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} pagination={false} />,
            document.getElementById('slice-list-content'));
    }

    function renderPagination() {
        render(<Pagination defaultCurrent={1} total={50} />,
            document.getElementById('slice-list-paging'));
    }

    function analysisData(data) {
        var sliceData = data.data;
        sliceData.forEach(function(slice, index) {
            var obj = {};
            obj.key = index + 1;
            obj.name = slice.slice_name;
            obj.type = slice.viz_type;
            obj.set = slice.datasource;
            obj.owner = slice.created_by_user;
            obj.state = slice.online;
            obj.time = slice.changed_on;
            dataSource.push(obj);
        });
        renderTable();
        renderPagination();
    }

    function getAbsUrl(relativePath) {
        return window.location.origin + relativePath;
    }

    $("#add").on("click", function() {

    });

    $("#delete").on("click", function() {

    });

    $("#showAll").on("click", function() {

    });

    $("#showFavorite").on("click", function() {

    });

    $("#searchInput").bind("keypress", function(event) {

        if(event.keyCode == 13) {

        }
    });

    getSliceList();
});


