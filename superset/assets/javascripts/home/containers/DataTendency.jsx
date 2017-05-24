import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import { createSelector } from 'reselect';
import  { Line } from "../components";


const _ = require('lodash');

class DataTendency extends Component {

    constructor(props) {
        super();
    }

    render() {
        let counts = this.props.ChartCounts || {
            dashboard: "",
            database: "",
            slice: "",
            table: ""
        };

        let lineChart = {};
        lineChart.statistic = {};
        lineChart.statistic.chart = this.props.lineData || {
            catagories: [],
            series: []
        };

        const { onChangeCatagory, catagory } = this.props;
        let chartTitle = "";
        switch(catagory) {
            case "dashboard":
                chartTitle = "仪表板"
                break;
            case "database":
                chartTitle = "连接";
                break;
            case "table":
                chartTitle = "数据集";
                break;
            case "slice":
                chartTitle = "工作表";
                break;
            default:
                chartTitle = "仪表板";
        }

        return (
            <div>
                <aside className="data-tendency white-bg-and-border-radius">
                    <hgroup className="data-title">
                        <h2>
                            <dl>
                                <dt>
                                    <i className="icon dashboard-icon"></i>
                                </dt>
                                <dd>
                                    <div className="count">{counts.dashboard}</div>
                                    <div className={catagory === 'dashboard' ? 'current name' : 'name'} onClick={ () => {onChangeCatagory('dashboard')}}>仪表盘</div>
                                </dd>
                            </dl>
                        </h2>
                        <h2>
                            <dl>
                                <dt>
                                    <i className="icon slice-icon"></i>
                                </dt>
                                <dd>
                                    <div className="count">{counts.slice}</div>
                                    <div className={catagory === 'slice' ? 'current name' : 'name'} onClick={ () => {onChangeCatagory('slice')}}>工作表</div>
                                </dd>

                            </dl>
                        </h2>
                        <h2>
                            <dl>
                                <dt>
                                    <i className="icon database-icon"></i>
                                </dt>
                                <dd>
                                    <div className="count">{counts.database}</div>
                                    <div className={catagory === 'database' ? 'current name' : 'name'} onClick={ () => {onChangeCatagory('database')}}>连接</div>
                                </dd>
                            </dl>
                        </h2>
                        <h2>
                            <dl>
                                <dt>
                                    <i className="icon table-icon"></i>
                                </dt>
                                <dd>
                                    <div className="count">{counts.table}</div>
                                    <div className={catagory === 'table' ? 'current name' : 'name'} onClick={ () => {onChangeCatagory('table')}}>数据集</div>
                                </dd>
                            </dl>
                        </h2>
                    </hgroup>
                    <div className="dashboard-linechart" style={{background:'transparent'}}>
                        <Line title={chartTitle} {...lineChart}/>
                    </div>
                </aside>
            </div>
        );
    }


}

const getLineChartData = createSelector(
    state => state.posts.param.trends,
    state => state.switcher.tendencyCatagory,
    (data, catagory) => {
        if (!data) {
            return "";
        }

        let lineData = {};
        let chart = {};
        let dataArr = [];
        _.forEach(data, (arr, key) => {
            lineData[key] = {
                catagories: [],
                series: [],
                catagoriesWithOutYear: []
            };

            chart = lineData[key];
            dataArr = [];

            _.forEach(arr, (obj, key) => {
                chart.catagories.push(obj.date);
                chart.catagoriesWithOutYear.push(obj.date.substr(5));
                dataArr.push(obj.count);
            });
            chart.series.push({
                name: key,
                data: dataArr
            });

            /***
            here the chart is like:
            {
                categories: []   //x
                series: [{
                    data: []    //y
                    name: ''    //line name
                }]
            }
            */
            lineData[key] = chart;
        });

        return lineData[catagory];
    }
);

DataTendency.propTypes = {
    ChartCounts: PropTypes.any.isRequired,
    lineData: PropTypes.any.isRequired,
}

const mapStateToProps = (state, pros) => {
    const { posts, switcher } = state;
    return {
        ChartCounts: posts.param.counts　|| {},
        lineData: getLineChartData(state),
        catagory: switcher.tendencyCatagory
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChangeCatagory: (catagory) => {
            dispatch({
                type: "CHANGE_CATAGORY_IN_TENDENCY",
                catagory: catagory
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DataTendency);