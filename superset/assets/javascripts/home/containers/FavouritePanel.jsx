import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

class FavouritePanel extends Component {
    constructor(props) {
        super();
    }

    componentWillReceiveProps(nextProps) {
    }

    render() {
        let selected = this.props.currentCatagory || "dashboard";
        const { onChangeCatagory } = this.props;

        return (
            <aside className="top10-and-worktimes">
                <div className="top10 white-bg-and-border-radius">
                    <div className="index-title-module">
                        <h3>收藏次数top10</h3>
                        <div className="title-tab">
                            <ul>
                                <li onClick={ () => {onChangeCatagory('dashboard')} } className={selected==='slice'?'':'current'}>仪表板</li>
                                <li onClick={ () => {onChangeCatagory('slice')} } className={selected==='slice'?'current':''}>工作表</li>
                            </ul>
                        </div>
                        <div className="transparent"></div>
                    </div>
                    <div className="times-barchart" style={{background:'transparent'}}>
                        这里是条形图
                    </div>
                </div>
                <div className="worktimes white-bg-and-border-radius">
                    <div className="index-title-module">
                        <h3>引用次数top10</h3>
                    </div>
                    <div className="times-barchart" style={{background:'transparent'}}>
                        这里是条形图
                    </div>
                </div>
            </aside>
        );
    }
}

FavouritePanel.propTypes = {
    currentCatagory: PropTypes.any.isRequired,
}

const mapStateToProps = (state) => {
    const { switcher } = state;
    return {
        currentCatagory: switcher.favoritePanelCatagory
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChangeCatagory: (catagory) => {
            dispatch({
                type: "SWITCH_TAB_IN_FAVOURITE",
                tab: catagory
            });
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FavouritePanel);