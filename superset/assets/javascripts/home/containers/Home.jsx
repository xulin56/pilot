import React, { Component } from 'react';
import { DataTendency, FavouriteAndCountPanel, EditAndEventPanel} from './';
import PropTypes from 'prop-types';
import { fetchPosts } from "../actions";
import { connect } from 'react-redux';

class Home extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(fetchPosts());
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps.param);
    }

    render() {

        const { param, state } = this.props;

        return (
          <div>
                <DataTendency></DataTendency>
                <FavouriteAndCountPanel></FavouriteAndCountPanel>
                <EditAndEventPanel></EditAndEventPanel>
          </div>
        );
    }
}

Home.propTypes = {
    param: PropTypes.any.isRequired,
    isFetching: PropTypes.any.isRequired,
    lastUpdated: PropTypes.any.isRequired
}

const mapStateToProps = (state, props) => {
    const { posts } = state;
    return {
        isFetching: posts.isFetching,
        param: posts.param,
        lastUpdated: posts.lastUpdated || false
    };
}

export default connect(mapStateToProps)(Home);