import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { navigateTo, fetchPostsIfNeeded } from '../actions';

import Pagination from './../components/pagination';
import Table from './../components/table';

class App extends Component {
  constructor(props) {
    super(props);
    // this.onPagination = this.onPagination.bind(this);
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
    this.props.dispatch( navigateTo(argus) );
  }

  render() {
    const { selectedReddit, dataSource, isFetching } = this.props;
    // const isEmpty = json.count === 0;
    const pageNumber = selectedReddit.pageNumber;
    const message = isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>;

    return (
      <div>
      	{!dataSource ?
      		message:<div style={{ opacity: isFetching ? 0.5 : 1 }}>
      			<Table {...dataSource} />
          </div>}

		<Pagination onPagination={this.onPagination.bind(this)} defaultCurrent={pageNumber} total={50} />
		<div className="appbuilder_datetime"></div>
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
    items: dataSource,
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

