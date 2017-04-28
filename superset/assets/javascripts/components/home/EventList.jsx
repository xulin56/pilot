import React, { Component } from 'react';
import PropTypes from 'prop-types';

function Event(props) {
  return (
    <ul>
      <li>
        <figure className="round-bg">
          <svg></svg>
        </figure>
        <span>{props.user}</span>
      </li>
      <li>
        <div className="explore_json-type">
          <dl>
            <dt>{props.action}</dt>
            <dd><svg></svg><strong>
              <a href="http://www.baidu.com/">'props.link'</a>
              {/* <a href="http://www.baidu.com/">{props.link}</a> */}
            </strong></dd>
          </dl>
        </div>
      </li>
      <li>{props.time}</li>
    </ul>
  );
}

Event.propTypes = {
  user: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  //href: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  //manipulate: PropTypes.string.isRequired
  //link: PropTypes.string.isRequired
};

export default class EventList extends Component {

  render() {

    const actions = this.props.actions

    const children = actions.map((action, key) =>
      <Event key={key} {...action} />
    );

    return (
      <div className="">
        {children}
      </div>
    );
  }
}
