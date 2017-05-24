import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import 'antd/lib/table/style/css';

function EventList(props) {
    const dataSource = props.eventList || [];
    const columns = [{
        title: '用户',
        dataIndex: 'user',
        key: 'user',
        width: '33%',
        sorter: (a, b) => a.user.localeCompare(b.user),
        render: (text, record) => (<a className="user-td" href={record.link}><i className="icon user-icon"></i>{text}</a>)
    }, {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        sorter: (a, b) => a.action.localeCompare(b.action),
        width: '33%',
        render: (text, record) => {
                    const classes = "icon action-title-icon " + record.type + "-icon";
                    return (
                        <div>
                            <div className="action-text">{text}</div>
                            <div className="action-title"><i className={classes}></i>{record.title}</div>
                        </div>
                    );
                }
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

EventList.propTypes = {
    eventList: PropTypes.array.isRequired,
};

export default EventList;