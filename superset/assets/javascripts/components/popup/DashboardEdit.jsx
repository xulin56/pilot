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
            slice: this.props.slice
        };
        // bindings
        this.confirm = this.confirm.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.showDialog = this.showDialog.bind(this);

        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    };

    showDialog() {
        document.getElementById("popup_dashboard").style.display = "flex";
    }

    closeDialog() {
        document.getElementById("popup_dashboard").style.display = "none";
    }

    handleTitleChange(e) {
        this.state.slice.dashboard_title = e.target.value;
        this.setState({
            slice: this.state.slice
        });
    }

    handleDescriptionChange(e) {
        this.state.slice.description = e.target.value;
        this.setState({
            slice: this.state.slice
        });
    }

    confirm() {
        document.getElementById("popup_dashboard").style.display = "none";
    }

    componentDidMount() {

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
                            <div className="dialog-item">
                                <div className="item-left">
                                    <span>标题：</span>
                                </div>
                                <div className="item-right">
                                    <input className="form-control dialog-input" value={this.props.slice.dashboard_title}
                                      onChange={this.handleTitleChange} />
                                </div>
                            </div>
                            <div className="dialog-item">
                                <div className="item-left">
                                    <span>描述：</span>
                                </div>
                                <div className="item-right">
                                    <textarea className="dialog-area" value={this.props.slice.description}
                                        onChange={this.handleDescriptionChange}></textarea>
                                </div>
                            </div>
                            <div className="dialog-item">
                                <div className="item-left">
                                    <span>工作表：</span>
                                </div>
                                <div className="item-right">
                                    <div></div>
                                </div>
                            </div>
                            <div className="dialog-item">
                                <div className="item-left">
                                    <span>数据集：</span>
                                </div>
                                <div className="item-right">
                                    <input className="form-control dialog-input"/>
                                </div>
                            </div>
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