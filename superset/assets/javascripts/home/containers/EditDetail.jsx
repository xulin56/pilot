import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fetchEditDetail } from "../actions";
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Redirect } from 'react-router-dom';
import { Table, Button } from 'antd';
import 'antd/lib/table/style/css';
import 'antd/lib/icon/style/css';

class EditDetail extends Component {

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this);
    }

    componentDidMount() {
        const { fetchEditDetail } = this.props;
        this.state = {
            redirect: false
        };
        fetchEditDetail();
    }

    goBack () {
        this.setState({redirect: true});
    }

    render() {
        let selected = this.props.currentCatagory;
        let dataSource = this.props.editList[selected];
        const onChangeCatagory = this.props.onChangeCatagory;
        const redirect = this.state ? this.state.redirect : false;

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
            <div className="edit-detail-page">
                <div className="edit-detail-page-title">
                    <div className="left">
                        <span className="title">最近编辑</span>
                        <span className="count-title">记录条目</span>
                        <span　className="count-value">20</span>
                    </div>
                    <div className="right">
                        <div className="title-tab">
                            <ul>
                                <li onClick={ () => {onChangeCatagory('dashboard')} } className={selected==='slice'?'':'current'}>仪表板</li>
                                <li onClick={ () => {onChangeCatagory('slice')} } className={selected==='slice'?'current':''}>工作表</li>
                            </ul>
                        </div>
                        <BackButton handleOnClick={this.goBack} redirect={redirect}></BackButton>
                    </div>
                </div>
                <Table className="edit-table" dataSource={dataSource} columns={columns} />
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

const getEidtListData = createSelector(
    state => state.posts.param.edits,
    (data) => {
        if (!data) {
            return {};
        }

        let result = {};
        let item =  {};
        let dataArr = [];
        _.forEach(data, (arr, key) => {
            result[key] = {};
            dataArr = [];
            _.forEach( arr, (obj, key) => {
                item = {
                    'key': key + 1,
                    'name': obj.name,
                    'action': obj.action,
                    'time': obj.time,
                    'link': obj.link
                };
                dataArr.push(item);
            });
            result[key] = dataArr;
        });

        return result;
    }
);

const mapStateToProps = (state, props) => {
    const { posts, switcher} = state;
    return {
        currentCatagory: switcher.editPanelCatagory,
        editList: getEidtListData(state)
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChangeCatagory: (catagory) => {
            dispatch({
                type: "SWITCH_TAB_IN_EDIT",
                tab: catagory
            });
        },
        fetchEditDetail: () => {
            dispatch(fetchEditDetail());
        }
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(EditDetail);