import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import { createSelector } from 'reselect';
import  { Bar } from "../components";

const _ = require('lodash');

class FavouriteAndCountPanel extends Component {
    constructor(props) {
        super();
    }

    render() {
        let selected = this.props.currentCatagory || "dashboard";
        const { onChangeCatagory, favbarData, refBarData } = this.props;

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
                        <Bar barData={favbarData}></Bar>
                    </div>
                </div>
                <div className="worktimes white-bg-and-border-radius">
                    <div className="index-title-module">
                        <h3>引用次数top10</h3>
                    </div>
                    <div className="times-barchart" style={{background:'transparent'}}>
                        <Bar barData={refBarData}></Bar>
                    </div>
                </div>
            </aside>
        );
    }
}

const getFavBarData = createSelector(
    state => state.posts.param.favorits,
    state => state.switcher.favoritePanelCatagory,
    (data, catagory) => {
        let barData = {
            series: {
                name: "个数",
                data: []
            },
            catagories: []
        };

        if (!data) {
            return barData;
        }

        let array = [];
        if (catagory === 'dashboard') {
            array = data['dashboard']
        }
        else {
            array = data['slice'];
        }
        _.forEach(array, (obj, key) => {
            barData.series.data.push(obj.count);
            barData.catagories.push(obj.name);
        });

        return barData;
    }
);

const getRefBarData = createSelector(
    state => state.posts.param.refers,
    (data) => {
        let barData = {
            series: {
                name: "个数",
                data: []
            },
            catagories: []
        }

        if (!data) {
            return barData;
        }

        _.forEach(data, (obj, key) => {
            barData.series.data.push(obj.count);
            barData.catagories.push(obj.name);
        });

        return barData;
    }
);

FavouriteAndCountPanel.propTypes = {
    currentCatagory: PropTypes.string.isRequired,
    favbarData: PropTypes.object,
    refBarData: PropTypes.object
}

const mapStateToProps = (state) => {
    const { switcher } = state;
    return {
        currentCatagory: switcher.favoritePanelCatagory,
        favbarData: getFavBarData(state),
        refBarData: getRefBarData(state)
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

export default connect(mapStateToProps, mapDispatchToProps)(FavouriteAndCountPanel);