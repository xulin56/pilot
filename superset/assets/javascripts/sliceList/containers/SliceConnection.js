import React, { Component } from 'react';
import { connect } from 'react-redux';
import { navigateTo, fetchPostsIfNeeded } from '../actions';

import {Pagination, Table, Operate } from '../components';

import PropTypes from 'prop-types';

class App extends Component {
  constructor(props) {
    super(props);
    this.onPagination = this.onPagination.bind(this);

    // this.state = {
    //   selectedRowKeys: []
    // }

    this.onSelectChange = this.onSelectChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
    const { dispatch, selectedReddit } = this.props;
    dispatch(fetchPostsIfNeeded(selectedReddit.pageNumber));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedReddit.pageNumber !== this.props.selectedReddit.pageNumber) {
      const { dispatch, selectedReddit } = nextProps;
      dispatch(fetchPostsIfNeeded(selectedReddit.pageNumber));
    }
  }

  onPagination(argus) {
    console.log(argus);
    this.props.dispatch( navigateTo(argus) );
  }

  onAdd() {
    console.log('add in SliceConnection');
  }

  onDelete() {
    console.log('onDelete in SliceConnection', this.state.selectedRowKeys);
  }

  onSelectChange(selectedRowKeys) {
    this.setState({selectedRowKeys});
    console.log(selectedRowKeys, this.state );

  }

  onFilter(argus){
    if(argus){
      console.log('all');
    } else {
      console.log('favorite');
    }
  }

  onSearch(argus) {
    console.log('onSearch in SliceConnection', argus );
  }

  render() {
    const { selectedReddit, dataSource, isFetching } = this.props;
    // const isEmpty = json.count === 0;
    const pageNumber = selectedReddit.pageNumber;
    const message = isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>;
    const me = this;

    return (
      <div>
        <div>工作表 &emsp;&emsp; 记录{dataSource.length +''}条

        </div>

        <Operate 
          onSearch = { me.onSearch } 
          onAdd = { me.onAdd }
          onDelete = { me.onDelete }
          onFilter = { me.onFilter }
        />

      	{!dataSource ?
      		message:<div style={{ opacity: isFetching ? 0.5 : 1, paddingBottom:'20px' }}>
      			<Table
              dataSource = {dataSource}
              onDelete = {me.onDelete}
              onSelectChange = {me.onSelectChange}
            />
          </div>
        }

    		<Pagination
          onPagination={this.onPagination}
          defaultCurrent={pageNumber}
          total={50} 
        />

      </div>
    );
  }
}

App.propTypes = {
  selectedReddit: PropTypes.object.isRequired,
  // dataSource: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const { postsBypageNumber, selectedReddit } = state;

  const {
    isFetching,
    lastUpdated,
    items: dataSource
  } = postsBypageNumber[selectedReddit.pageNumber] || {
    isFetching: true,
    items: [],
  };

  return {
    selectedReddit,
    dataSource,
    isFetching,
    lastUpdated,
  };
}

export default connect(mapStateToProps)(App);

