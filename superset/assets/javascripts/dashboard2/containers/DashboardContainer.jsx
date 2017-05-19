import React, { PropTypes } from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import { addSliceAction, editSliceAction, publishSliceAction, deleteSliceAction, fetchSliceListPromise } from '../actions';

import { DashboardEdit, SliceEdit, Confirm } from '../../components/popup';
import { Pagination, Table } from 'antd';
import 'antd/dist/antd.css';

const $ = window.$ = require('jquery');

const propTypes = {
    dispatch: PropTypes.func.isRequired
};

const defaultProps = {
    columns: [{
        title: '',
        dataIndex: 'favorite',
        key: 'favorite',
        width: '5%',
        render: (text, record) => {
            return (
                <div>
                    <button className="btn btn-default" onClick={() => this.favoriteSlice(record)}>
                        收藏
                    </button>
                </div>
            )
        }
    }, {
        title: '名称',
        dataIndex: 'dashboard_title',
        key: 'dashboard_title',
        sorter: true,
        width: '30%'
    }, {
        title: '发布状态',
        dataIndex: 'online',
        key: 'online',
        sorter: true,
        width: '15%'
    }, {
        title: '所有者',
        dataIndex: 'created_by_user',
        key: 'created_by_user',
        sorter: true,
        width: '15%'
    }, {
        title: '最后修改时间',
        dataIndex: 'changed_on',
        key: 'changed_on',
        sorter: true,
        width: '15%'
    }, {
        title: '操作',
        key: 'action',
        width: '20%',
        render: (text, record, index) => {
            return (
                <div>
                    <button className="btn btn-default" onClick={() => this.editSlice(record)}>编辑</button>&nbsp;
                    <button className="btn btn-default" onClick={() => this.publishSlice(record)}>发布</button>&nbsp;
                    <button className="btn btn-default" onClick={() => this.deleteSlice(record)}>删除</button>
                </div>
            )
        }
    }],
    rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User'
        })
    },
    dataSource: []
};

class DashboardContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };

        this.addSlice = this.addSlice.bind(this);
        this.deleteSlices = this.deleteSlices.bind(this);
        this.importDashboard = this.importDashboard.bind(this);
        this.exportDashboard = this.exportDashboard.bind(this);
        this.showAll = this.showAll.bind(this);
        this.showFavorite = this.showFavorite.bind(this);

        this.shrink = this.shrink.bind(this);
        this.enlarge = this.enlarge.bind(this);

        function getSliceList() {
            let url = window.location.origin + "/dashboardmodelview/listdata/";
            const { dispatch } = props;
            dispatch(fetchSliceListPromise(url));
        }

        getSliceList();
    };

    componentDidMount() {

    }

    editSlice(record) {

        var editSlicePopup = render(<DashboardEdit slice={record}/>,
            document.getElementById('popup_root'));
        if(editSlicePopup) {
            editSlicePopup.showDialog();
        }
    }

    publishSlice(record) {

    }

    deleteSlice(record) {
        var deleteSlicePopup = render(<Confirm slice={record}/>,
            document.getElementById('popup_root'));
        if(deleteSlicePopup) {
            deleteSlicePopup.showDialog();
        }
    }

    favoriteSlice(text, record) {

    }

    addSlice() {

    }

    deleteSlices() {

    }

    importDashboard() {

    }

    exportDashboard() {

    }

    showAll() {

    }

    showFavorite() {

    }

    shrink() {

    }

    enlarge() {

    }

    render() {
        console.log("render-this.props=", this.props);
        const { columns, rowSelection, dataSource } = this.props;
        return (
            <div className="dashboard-content">
                <div className="operation">
                    <div>
                        <i className="glyphicon glyphicon-dashboard"></i>
                        <span>仪表盘</span>
                        <span>记录条目</span>
                        <span>07</span>
                    </div>
                    <div>
                        <button id="add" className="btn btn-default" onClick={this.addSlice}>+</button>
                        <button id="delete" className="btn btn-default" onClick={this.deleteSlices}>-</button>
                        <button id="upload" className="btn btn-default" onClick={this.importDashboard}>upload</button>
                        <button id="download" className="btn btn-default" onClick={this.exportDashboard}>download</button>
                        <button id="showAll" className="btn btn-default" onClick={this.showAll}>全部</button>
                        <button id="showFavorite" className="btn btn-default" onClick={this.showFavorite}>收藏</button>
                        <input id="searchInput" placeholder="search..." />
                        <button id="shrink" className="btn btn-default" onClick={this.shrink}>shrink</button>
                        <button id="enlarge" className="btn btn-default" onClick={this.enlarge}>enlarge</button>
                    </div>
                </div>
                <div id="dashboard-list-content" className="list-content">
                    <Table
                        rowSelection={rowSelection}
                        dataSource={dataSource}
                        columns={columns}
                        pagination={false} />
                </div>
                <div id="dashboard-list-paging" className="list-paging">
                    <Pagination
                        defaultCurrent={1}
                        total={50} />
                </div>
            </div>
        );
    }
}

DashboardContent.propTypes = propTypes;
DashboardContent.defaultProps = defaultProps;

function mapStateToProps(state) {
    console.log("state=", state);
    if(state.sliceOperation.listData) {
        return {
            dataSource: state.sliceOperation.listData
        }
    }else {
        return {}
    }
}

export default connect(mapStateToProps)(DashboardContent);
