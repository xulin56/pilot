import React from 'react';
import ReactDOM from 'react-dom';
import { message, Table, Icon } from 'antd';

import PropTypes from 'prop-types';

function getDataSource(argus) {
  let arr = [];
  let obj = {};
  if(!argus.dataSource || argus.dataSource.length==0) return;

  argus.dataSource.map(function(value, index, array) {
    obj = {
      key: value.id,
      slice_name: value.slice_name,
      viz_type: value.viz_type,
      datasource: value.datasource,
      created_by_user: value.created_by_user,
      online: value.online,
      changed_on: value.changed_on,
      id: value.id,

      // name: slice_name + slice_url + description
      slice_url: value.slice_url,
      description: value.description
    };
    arr.push(obj);
  });
  return arr;
}

const columns = [
{
  title: '名称',  //TODO: title need to i18n
  key: 'name',
  render: (text, record) => {
    return (
      <span>
        <a target="_blank" href={record.slice_url}>{record.slice_name}</a>
        <br />{record.description}
      </span>
    )
  },
  sorter: (a, b) => a.slice_name-b.slice_name,
}, {
  title: '图标类型',
  dataIndex: 'viz_type',
  key: 'viz_type',
  sorter: (a, b) => a-b  //TODO
}, {
  title: '数据集',
  dataIndex: 'datasource',
  key: 'datasource',
  sorter: (a, b) => a-b
}, {
  title: '所有者',
  dataIndex: 'created_by_user',
  key: 'created_by_user',
  sorter: (a, b) => a-b
}, {
  title: '发布状态',
  dataIndex: 'online',
  key: 'online',
  sorter: (a, b) => a-b,
  render: (text, record) => record.online?'已发布':'未发布'
}, {
  title: '最后修改时间',
  dataIndex: 'changed_on',
  key: 'changed_on',
  sorter: (a, b) => a.changed_on-b.changed_on
}, {
  title: '操作',
  key: 'action',
  render: (text, record) => (
    <span>
      <a href="#">Action 一 {record.name}</a>

      <span className="ant-divider" />

      <a href="#">Delete</a>

      <span className="ant-divider" />

      <a href="#" className="ant-dropdown-link">
        More actions <Icon type="down" />
      </a>
    </span>
  )
}]

class SliceTable extends React.Component {
  constructor(props) {
    super(props);
    const defaultCurrent = 2;

    this.state = {
      selectedRowKeys: [],  // Check here to configure the default column
    }

    this.onSelectChange = this.onSelectChange.bind(this)
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });

    const {onSelectChange} = this.props;
    onSelectChange && onSelectChange(selectedRowKeys)
  }

  render() {

    const { selectedRowKeys } = this.state;
    const { dataSource } = this.props;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };


    const onChange = (pagination, filters, sorter)=> {
      console.log('params in onChange:', pagination, filters, sorter);
      console.log( rowSelection, 'is rowSelection')
    }

    const onShowSizeChange = (current, pageSize) => {
      console.log(current, pageSize);
    }

    return (
        <Table
          onChange={onChange}
          rowSelection={rowSelection}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
        />
    );
  }
}

export default SliceTable;