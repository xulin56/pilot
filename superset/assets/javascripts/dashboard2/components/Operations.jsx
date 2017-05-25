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
                <ul className="icon-list">
                    <li id="add" onClick={this.addSlice}><i className="icon"></i></li>
                    <li id="delete" onClick={this.deleteSlices}><i className="icon"></i></li>
                    <li id="upload" onClick={this.importDashboard}><i className="icon"></i></li>
                    <li id="download" onClick={this.exportDashboard}><i className="icon"></i></li>
                </ul>
                <div className="tab-btn">
                    <button id="showAll" className="active" onClick={this.showAll}>全部</button>
                    <button id="showFavorite" onClick={this.showFavorite}><i className="icon"></i>收藏</button>
                </div>
                <div className="search-input">
                    <input id="searchInput" placeholder="search..." />
                    <i className="icon"></i>
                </div>
                <div className="operation-btn">
                    <button id="shrink"><i className="icon active"></i></button>
                    <button id="enlarge"><i className="icon active"></i></button>
                </div>
            </div>
        );
    }
}

Operations.propTypes = propTypes;
Operations.defaultProps = defaultProps;

export default Operations;