import React from 'react';
import ReactHighcharts from 'react-highcharts';
import PropTypes from 'prop-types';

function Line(props) {

    if (!props.statistic) return <p>数据异常</p>;

    const {catagories, series, catagoriesWithOutYear} = props.statistic.chart || {
        catagories: [],
        series: []
    };
    const title = props.title;

    const config = {
        chart: {
            type: 'area'
        },
        credits: {
            enabled: false
        },
        title: {
            text: title + '数量变化趋势',
            align: "left"
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        tooltip: {
            valueSuffix: ''
        },
        legend: {
            enabled: false
        },
        xAxis: {
            categories: catagoriesWithOutYear
        },
        series
    };

    return (
        <ReactHighcharts config={config} />
    );
}

Line.propTypes = {
  statistic: PropTypes.any
};

export default Line;
