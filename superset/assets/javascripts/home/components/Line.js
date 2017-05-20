import React from 'react';
import ReactHighcharts from 'react-highcharts';
import PropTypes from 'prop-types';

function Line(props) {

  if (!props.statistic) return <p>数据异常</p>;

  const { categories, series } = props.statistic.chart || {
    categories: [],
    series: []
  };
  series.name = '';
  const config = {
    credits: {
      enabled: false
    },
    title: {
      text: '仪表板数量变化趋势',
      x: -300
    },
    // subtitle: {
    //   text: '仪表板数量变化趋势',
    //   x: -20
    // },

    yAxis: {
      title: {
        // text: 'Temperature (°C)'
      }
    },
    tooltip: {
      valueSuffix: ''
    },
    // legend: {
    //   layout: 'vertical',
    //   align: 'left',
    //   verticalAlign: 'top',
    //   borderWidth: 1
    // },

    xAxis: {
      categories
    },
    series
  };
  return (
    <ReactHighcharts config={config}/>
  );
}

Line.propTypes = {
  statistic: PropTypes.any
};

export default Line;
