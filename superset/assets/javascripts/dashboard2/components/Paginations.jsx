import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import { Pagination } from 'antd';
import 'antd/dist/antd.css';

const propTypes = {};
const defaultProps = {};

class Paginations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        // bindings

    };

    componentDidMount() {

    }

    render() {
        return (
            <div className="dashboard-paging">
                <Pagination
                    defaultCurrent={1}
                    total={50} />
            </div>
        );
    }
}

Paginations.propTypes = propTypes;
Paginations.defaultProps = defaultProps;

export default Paginations;