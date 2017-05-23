import React from 'react';
import ReactHighcharts from 'react-highcharts';
import PropTypes from 'prop-types';
const _ = require('lodash');

function makeDummy(data, max) {
     var dummy = [];
    _.forEach(data, function(i, point) {
         dummy.push(max - point);
    });
    return dummy;
}

function Bar(props) {
    if (!props.barData) {
        return <p>数据异常</p>;
    }

    const { catagories, series } = props.barData || {
        catagories: [],
        series: {
            name: "",
            data: []
        }
    };
    let maxs = [];
    maxs.push(Math.max.apply(null, series.data));
    let max = Math.round(Math.max.apply(null, maxs) * 1.1);
    let dummyData =  makeDummy(series.data, max);

    const config = {
        chart: {
            type: 'bar'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: catagories,
            title: {
                text: null
            },
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            minorTickLength: 0,
            tickLength: 0,
        },
        yAxis: {
            min: 0,
            max: max,
            title: {
                text: '',
                align: 'high'
            },
            visible: false
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    align: 'right',
                    color: '#FFFFFF',
                    x: -10
                },
                pointPadding: 0.1,
                groupPadding: 0,
                stacking:'normal'
            }
        },
        tooltip: {
            valueSuffix: '',
            // followPointer: true
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        series: [
            {
                stack: 'a',
                showInLegend: false,
                enableMouseTracking: false,
                name: 'Fill Series',
                color:'#f5f8fa',
                data:dummyData,
                maxPointWidth: 60,
                dataLabels: {
                     enabled: false
                }
            },
            {
                stack:'a',
                name: series.name,
                data: series.data,
                maxPointWidth: 60
            }
        ]
    };


    return (
        <ReactHighcharts config={config}></ReactHighcharts>
    );
}

Bar.propTypes = {
    barData: PropTypes.object
};

export default Bar;