/**
 * Created by haitao on 17-5-11.
 */
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

const propTypes = {

};

const defaultProps = {
};

class DashboardEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        // bindings
        this.confirm = this.confirm.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.showDialog = this.showDialog.bind(this);
    };

    showDialog() {
        console.log(document.getElementById("popup_dashboard"));
        document.getElementById("popup_dashboard").style.display = "flex";
    }

    confirm() {

    }

    closeDialog() {

        document.getElementById("popup_dashboard").style.display = "none";
    }

    componentWillMount() {

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div id="popup_dashboard" className="popup">
                <div className="popup-dialog popup-md">
                    <div className="popup-content">
                        <div className="popup-header">
                            <div className="header-left">
                                <i className="icon"></i>
                                <span>仪表盘基本信息</span>
                            </div>
                            <div className="header-right">
                                <i className="glyphicon glyphicon-remove" onClick={this.closeDialog}></i>
                            </div>
                        </div>
                        <div className="popup-body">

                        </div>
                        <div className="popup-footer">
                            <button className="tp-btn tp-btn-middle tp-btn-primary" onClick={this.confirm}>
                                确定
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

DashboardEdit.propTypes = propTypes;
DashboardEdit.defaultProps = defaultProps;

export default DashboardEdit;