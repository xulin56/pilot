import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

const propTypes = {};
const defaultProps = {};

class Operations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        // bindings
        this.addSlice = this.addSlice.bind(this);
        this.deleteSlices = this.deleteSlices.bind(this);
        this.importDashboard = this.importDashboard.bind(this);
        this.exportDashboard = this.exportDashboard.bind(this);
        this.showAll = this.showAll.bind(this);
        this.showFavorite = this.showFavorite(this);
    };

    addSlice() {

    }

    deleteSlices() {

    }

    importDashboard() {

    }

    exportDashboard() {

    }

    showAll() {

    }

    showFavorite() {

    }

    componentDidMount() {

    }

    render() {
        return (
            <div className="dashboard-operation">
                <button id="add" className="btn btn-default" onClick={this.addSlice}>+</button>
                <button id="delete" className="btn btn-default" onClick={this.deleteSlices}>-</button>
                <button id="upload" className="btn btn-default" onClick={this.importDashboard}>import</button>
                <button id="download" className="btn btn-default" onClick={this.exportDashboard}>export</button>
                <button id="showAll" className="btn btn-default" onClick={this.showAll}>全部</button>
                <button id="showFavorite" className="btn btn-default" onClick={this.showFavorite}>收藏</button>
                <input id="searchInput" placeholder="search..." />
                <button id="shrink" className="btn btn-default">shrink</button>
                <button id="enlarge" className="btn btn-default">enlarge</button>
            </div>
        );
    }
}

Operations.propTypes = propTypes;
Operations.defaultProps = defaultProps;

export default Operations;