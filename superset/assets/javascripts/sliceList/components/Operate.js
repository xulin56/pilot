
import React from 'react';
import ReactDOM from 'react-dom';

import { Pagination } from 'antd';

import PropTypes from 'prop-types';

class SlicePagination extends React.Component {
  constructor(props) {
    super(props);

    // console.log( 'props', props );
    this.state = {
      searchButton: {}
    }

    this.onChange = this.onChange.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onFilter = this.onFilter.bind(this);
  }

  componentDidMount() {
    this.setState({
      searchButton: document.querySelector('#searchButton'),
      searchField: document.querySelector('#searchField')
    });
  }

  onChange() {
    console.log('onBlur in Operate');
    console.log(this.state.searchField.value);

    if( this.state.searchField.value ){
      this.state.searchButton.removeAttribute('disabled');
      this.setState({
        searchValue: this.state.searchField.value
      });
    } else {
      this.state.searchButton.setAttribute('disabled', 'disabled');
    }
  }

  onAdd() {
    const me = this;
    const {onAdd} = me.props;
    onAdd && onAdd();
  }

  onDelete() {
    const me = this;
    const {onDelete} = me.props;
    onDelete && onDelete();
  }

  onSearch() {
    const me = this;

    if(!this.state.searchValue){
      return;
    }

    const {onSearch} = me.props;
    onSearch && onSearch(me.state.searchValue);

  }

  onFilter(argus) {
    const {onFilter} = this.props;
    onFilter&& onFilter(argus);
  }

  render(argus) {

    const { loading, selectedRowKeys } = this.state;
    const me = this;

    //when page size been modified
    const onShowSizeChange = (pageNumber, pageSize) => {
      // console.log( 'onShowSizeChange:', 'pageNumber:', pageNumber, 'pageSize:', pageSize );
    }

    //when page id been modified
    function onChange(pageNumber) {
      // console.log('onChange, pageNumber: ', pageNumber);
    }

    function showTotal(total) {
      return `Total ${total} items`;
    }

    return (
      <div>
        <span>
          <button onClick={this.onAdd}>+++</button>
          <button onClick={this.onDelete}>----</button>
        </span>
        <span>
          <button onClick={()=>this.onFilter(1)}>all</button>
          <button onClick={()=>this.onFilter(0)}>favorite</button>
        </span>
        <span>
          <input type="search" id="searchField" onChange={this.onChange} placeholder="search.." />
          <input type="button" id="searchButton" value="search" onClick={this.onSearch} />
        </span>
      </div>
    );
  }
}

SlicePagination.propTypes = {
  defaultCurrent: PropTypes.any.isRequired,
  total: PropTypes.any.isRequired
};

SlicePagination.defaultProps = {
  defaultCurrent: '',
  total: ''
}

export default SlicePagination;