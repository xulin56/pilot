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
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
}, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
}, {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
}, {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
        <div>
            <button class="btn btn-default">编辑</button>&nbsp;
            <button class="btn btn-default">发布</button>&nbsp;
            <button class="btn btn-default">删除</button>
        </div>
    )
}];

const dataSource = [{
    key: '1',
    name: 'Mike',
    age: 32,
    address: '10 Downing Street'
}, {
    key: '2',
    name: 'John',
    age: 42,
    address: '10 Downing Street'
}];

const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User',    // Column configuration not to be checked
    }),
};

$(document).ready(function() {

    function getSliceList() {
        var url = "http://localhost:8086/slicemodelview/listdata/";
        $.getJSON(url, function (data) {
            console.log("data=", data);

        });
    }

    render(<Table rowSelection={rowSelection} dataSource={dataSource} columns={columns}/>,
        document.getElementById('slice-list-content'));

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


