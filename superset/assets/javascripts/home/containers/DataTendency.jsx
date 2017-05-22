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

    componentDidMount() {
        // console.log(this.props.chartData);
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps.lineData, "sss");
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
        let lineData = this.props.lineData || {
            dashboard: {catagories: [], series: []},
            database: "",
            slice: "",
            table: ""
        };
        lineChart.statistic.chart = lineData['dashboard'];



        return (
            <div>
                <aside className="data-tendency white-bg-and-border-radius">
                    <hgroup className="data-title">
                        <h2 className="current">
                            <dl>
                                <dt>
                                    <svg>
                                        {/*<use xlink:href="#analysis"></use>*/}
                                    </svg>
                                    <span>{counts.dashboard}</span>
                                </dt>
                                <dd>仪表盘</dd>
                            </dl>
                        </h2>
                        <h2>
                            <dl>
                                <dt>
                                    <svg>
                                        {/*<use xlink:href="#analysis"></use>*/}
                                    </svg>
                                    <span>{counts.database}</span>
                                </dt>
                                <dd>工作表</dd>
                            </dl>
                        </h2>
                        <h2>
                            <dl>
                                <dt>
                                    <svg>
                                        {/*<use xlink:href="#analysis"></use>*/}
                                    </svg>
                                    <span>{counts.slice}</span>
                                </dt>
                                <dd>连接</dd>
                            </dl>
                        </h2>
                        <h2>
                            <dl>
                                <dt>
                                    <svg>
                                        {/*<use xlink:href="#analysis"></use>*/}
                                    </svg>
                                    <span>{counts.table}</span>
                                </dt>
                                <dd>数据集</dd>
                            </dl>
                        </h2>
                    </hgroup>
                    <div className="dashboard-linechart" style={{background:'transparent'}}>
                        <Line {...lineChart}/>
                    </div>
                </aside>
            </div>
        );
    }


}

const getLineChartData = createSelector(
    state => state.posts.param.trends,
    (data) => {
        if (!data) {
            return "";
        }

        let lineData = {};
        let chart = {};
        let dataArr = [];
        _.forEach(data, (arr, key) => {
            lineData[key] = {
                catagories: [],
                series: []
            };

            chart = lineData[key];
            dataArr = [];

            _.forEach(arr, (obj, key) => {
                chart.catagories.push(obj.date);
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

        return lineData;
    }
);


// const mapStateToProps = (state, pros) => {
//     return {
//         chartData: getVisibleChartData(state, props)
//     }
// }

DataTendency.propTypes = {
    ChartCounts: PropTypes.any.isRequired,
    lineData: PropTypes.any.isRequired,
}

const mapStateToProps = (state, pros) => {
    const { posts } = state;
    return {
        ChartCounts: posts.param.counts　|| {},
        lineData: getLineChartData(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChangeCatagory: (catagory) => {
            dispatch(changeCatagory(catagory))
        }
    }
}

export default connect(mapStateToProps)(DataTendency);