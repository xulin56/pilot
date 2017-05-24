import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fetchEventDetail } from "../actions";
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Table, Button } from 'antd';
import { Redirect } from 'react-router-dom';
import 'antd/lib/table/style/css';
import 'antd/lib/icon/style/css';

const _ = require('lodash');

class EventDetail extends Component {

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        this.state = {
            redirect: false
        };
        dispatch(fetchEventDetail());
    }

    goBack () {
        this.setState({redirect: true});
    }

    render() {

        const dataSource = this.props.actions;
        const redirect = this.state ? this.state.redirect : false;

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
            <div className="event-detail-page">
                <div className="event-detail-page-title">
                    <span className="title">事件</span>
                    <BackButton handleOnClick={this.goBack} redirect={redirect}></BackButton>
                </div>
                <Table className="event-table" dataSource={dataSource} columns={columns} />
            </div>
        );
    }
}

function BackButton(props) {
    if (props.redirect) {
        return <Redirect push to="/" />;
    }
    else {
        return <Button onClick={props.handleOnClick} className="back-button" icon="left">返回</Button>;
    }
}

const getActionList = createSelector(
    state => state.posts.param.actions,
    (data) => {
        if (!data) {
            return [];
        }

        let result = [];
        let item = {};

        _.forEach(data, (obj, key) => {
            item = {
                'key': key + 1,
                'user': obj.user,
                'action': obj.action,
                'time': obj.time,
                'link': obj.link,
                'title': obj.title,
                'type': obj.obj_type
            };
            result.push(item);
        });

        return result;
    }
);

const mapStateToProps = (state, props) => {
    const { posts } = state;
    return {
        actions: getActionList(state)
    };
}


export default connect(mapStateToProps)(EventDetail);