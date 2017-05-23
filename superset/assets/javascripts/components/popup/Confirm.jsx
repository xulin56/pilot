import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

const propTypes = {};
const defaultProps = {};

class Confirm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        // bindings
        this.confirm = this.confirm.bind(this);
        this.cancel = this.cancel.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.showDialog = this.showDialog.bind(this);
    };

    showDialog() {

        document.getElementById("popup_confirm").style.display = "flex";
    }

    closeDialog() {

        document.getElementById("popup_confirm").style.display = "none";
    }

    confirm() {

    }

    cancel() {
        document.getElementById("popup_confirm").style.dislay = "none";
    }

    componentDidMount() {

    }

    render() {
        return (
            <div id="popup_confirm" className="popup" style={{display:'none'}}>
                <div className="popup-dialog popup-md">
                    <div className="popup-content">
                        <div className="popup-header">
                            <div className="header-left">
                                <i className="icon"></i>
                                <span>工作表基本信息</span>
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
                            <button className="tp-btn tp-btn-middle tp-btn-primary" onClick={this.cancel}>
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Confirm.propTypes = propTypes;
Confirm.defaultProps = defaultProps;

export default Confirm;
