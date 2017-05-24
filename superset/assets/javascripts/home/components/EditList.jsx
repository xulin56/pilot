import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import 'antd/lib/table/style/css';

function Edit(props) {
    return (
        <Table dataSource={props.dataSource} columns={props.columns} />
    );
}

Edit.propTypes = {
    name: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
};

export default class EditList extends Component {
    constructor(props) {
        super();
    }

    render() {
        const listDashboard = this.props.dashboard;
        const listSlice = this.props.slice;

        const dataSource = (this.props.catagory === 'dashboard'? listDashboard : listSlice) || [];
        const columns = [{
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: '33%',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (<a href={record.link}>{text}</a>)
        }, {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            sorter: (a, b) => a.action.localeCompare(b.action),
            width: '33%'
        }, {
            title: '编辑时间',
            dataIndex: 'time',
            key: 'time',
            sorter: (a, b) => { return a.time > b.time　? 1 : -1;},
            width: '30%',
            className: 'time-col'
        }];

        return (
            <Table dataSource={dataSource} columns={columns} />
        );
    }
}
