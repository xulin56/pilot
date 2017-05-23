import React, { Component } from 'react';
import PropTypes from 'prop-types';

function Edit(props) {
    return (
        <dl>
            <dt>{/*{props.name}*/}name</dt>
            <dd>{props.time}</dd>
        </dl>
    );
}

Edit.propTypes = {
    name: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
};

export default class EditList extends Component {
  /*
    props = ...params
  */
    constructor(props) {
        super();
    }

    componentWillMount() {}
    componentWillUnmount() {}

    render() {
        const listDashboard = this.props.dashboard;
        const listSlice = this.props.slice;

        const list = (this.props.catagory === 'dashboard'? listDashboard : listSlice) || [];

        const children = list.map((edit, key) =>
            <Edit key={key} {...edit} />
        );

        return (
            <div className="">
                {children}
            </div>
        );
    }
}
