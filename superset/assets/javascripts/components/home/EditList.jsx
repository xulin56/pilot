import React, { Component, PropTypes } from 'react';


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
  //manipulate: PropTypes.string.isRequired
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

    const tables = this.props.statistic.tables;

    const listDashboard = tables.dashboard;
    const listSlice = tables.slice;

    const list = (this.props.current === 'dashboard'? listDashboard : listSlice);

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
