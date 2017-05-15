import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Operate } from './components/Slice';
import { DashboardEdit, SliceEdit } from './components/popup';

import { DatePicker, Table } from 'antd';
import 'antd/dist/antd.css';

const $ = window.$ = require('jquery');

const columns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name'
}, {
    title: '图标类型',
    dataIndex: 'type',
    key: 'type'
}, {
    title: '数据集',
    dataIndex: 'set',
    key: 'set'
}, {
    title: '所有者',
    dataIndex: 'owner',
    key: 'owner'
}, {
    title: '发布状态',
    dataIndex: 'state',
    key: 'state'
}, {
    title: '最后修改时间',
    dataIndex: 'time',
    key: 'time'
}, {
    title: '操作',
    key: 'action',
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
        var url = "http://localhost:8086/slicemodelview/listdata/";
        $.getJSON(url, function (data) {
            analysisData(data);
        });
    }

    function renderTable() {

        render(<Table rowSelection={rowSelection} dataSource={dataSource} columns={columns}/>,
            document.getElementById('slice-list-content'));
    }

    function analysisData(data) {
        var sliceData = data.data;
        sliceData.forEach(function(slice) {
            var obj = {};
            obj.name = slice.title;
            obj.type = slice.viz_type;
            obj.set = "";
            obj.owner = slice.owner;
            obj.state = "未发布";
            obj.time = slice.time;
            dataSource.push(obj);
        });
        renderTable();
    }

    $("#addSlice").click(function() {

    });

    $("#deleteSlice").click(function() {

    });

    $("#showAll").click(function() {

    });

    $("#showFavorite").click(function() {

    });

    getSliceList();
});


