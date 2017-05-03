import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

const propTypes = {
    
};

const defaultProps = {
    
};

class SliceEdit extends React.Component {
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

        document.getElementById("popup").style.display = "flex";
    }

    confirm() {
        
    }

    closeDialog() {
        
        document.getElementById("popup").style.display = "none";
    }

    componentWillMount() {

    }

    componentDidMount() {
        
    }

    componentWillUnmount() {
        
    }

    render() {
        return (
            <div id="popup" className="popup">
                <div className="popup-dialog popup-md">
                    <div className="popup-content">
                        <div className="popup-header">
                            <div className="header-left">
                                <i className="glyphicon glyphicon-share"></i>
                                <span>基本信息</span>
                            </div>
                            <div className="header-right">
                                <i className="glyphicon glyphicon-remove" onClick={this.closeDialog}></i>
                            </div>
                        </div>
                        <div className="popup-body">
                            <div className="dialog-item">
                                <div className="item-left">
                                    <span>名称：</span>
                                </div>
                                <div className="item-right">
                                    <input className="form-control dialog-input"/>
                                </div>
                            </div>
                            <div className="dialog-item">
                                <div className="item-left">
                                    <span>描述：</span>
                                </div>
                                <div className="item-right">
                                    <textarea className="dialog-area"></textarea>
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
                                <div className="sub-item">
                                    <div className="item-left">
                                        <span>创建者：</span>
                                    </div>
                                    <div className="item-right">
                                        <span></span>
                                    </div>
                                </div>
                                <div className="sub-item">
                                    <div className="item-left">
                                        <span>修改者：</span>
                                    </div>
                                    <div className="item-right">
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="dialog-item">
                                <div className="sub-item">
                                    <div className="item-left">
                                        <span>创建日期：</span>
                                    </div>
                                    <div className="item-right">
                                        <span></span>
                                    </div>
                                </div>
                                <div className="sub-item">
                                    <div className="item-left">
                                        <span>修改时间：</span>
                                    </div>
                                    <div className="item-right">
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="popup-footer">
                            <button className="btn btn-success" onClick={this.confirm}>
                                <span>确定</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

SliceEdit.propTypes = propTypes;
SliceEdit.defaultProps = defaultProps;

export default SliceEdit;