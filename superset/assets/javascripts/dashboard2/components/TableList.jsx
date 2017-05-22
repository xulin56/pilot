import React, { PropTypes } from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import { addSliceAction, editSliceAction, publishSliceAction, deleteSliceAction, fetchSliceListPromise } from '../actions';
import { DashboardEdit, SliceEdit, Confirm } from '../../components/popup';

import { Table } from 'antd';
import 'antd/dist/antd.css';

function editSlice(record) {
    var editSlicePopup = render(<DashboardEdit slice={record}/>,
        document.getElementById('popup_root'));
    if(editSlicePopup) {
        editSlicePopup.showDialog();
    }
}

function publishSlice() {

}

function deleteSlice(record) {
    var deleteSlicePopup = render(<Confirm slice={record}/>,
        document.getElementById('popup_root'));
    if(deleteSlicePopup) {
        deleteSlicePopup.showDialog();
    }
}

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
                    <button className="btn btn-default" onClick={() => favoriteSlice(record)}>
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
                    <button className="btn btn-default" onClick={() => editSlice(record)}>编辑</button>&nbsp;
                    <button className="btn btn-default" onClick={() => publishSlice(record)}>发布</button>&nbsp;
                    <button className="btn btn-default" onClick={() => deleteSlice(record)}>删除</button>
                </div>
            )
        }
    }],
    rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log("selectedRows=", selectedRows);
        },
        getCheckboxProps: record => ({

        })
    },
    dataSource: []
};

class TableList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        function getSliceList() {
            let url = window.location.origin + "/dashboardmodelview/listdata/";
            const { dispatch } = props;
            dispatch(fetchSliceListPromise(url));
        }

        getSliceList();
    };

    componentDidMount() {

    }

    render() {

        const { columns, rowSelection, dataSource } = this.props;
        return (
            <div className="dashboard-table">
                <Table
                    rowSelection={rowSelection}
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false} />
            </div>
        );
    }
}

TableList.propTypes = propTypes;
TableList.defaultProps = defaultProps;

function mapStateToProps(state) {

    if(state.sliceOperation.listData) {
        return {
            dataSource: state.sliceOperation.listData
        }
    }else {
        return {}
    }
}

export default connect(mapStateToProps)(TableList);