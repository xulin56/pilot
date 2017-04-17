import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import counter from './reducers';
// import Statistic from './containers/Statistic/Statistic';
import {  Statistic } from './containers';

import { loadStatistic } from './actions/statistic';


const $ = window.$ = require('jquery');
const _ = require('lodash');
/* eslint no-unused-vars: 0 */
// const jQuery = window.jQuery = $;

$(function () {
  let url = '/home';
  let json = {};
  let chart = {};
  let dataArr = [];
  let param = {};
  
  $.getJSON(url, function (data) {

  	//data.index.trends

    _.forEach( data.index.trends, (arr, key) =>{
      json[key] = {
      	categories: [],
      	series: []
      };
      chart = json[key];
      dataArr = [];

      _.forEach(arr, (obj, key) => {
      	chart.categories.push(obj.date);
      	dataArr.push(obj.count);
      });
      chart.series.push({
      	name: key,
      	data: dataArr//.reverse()//TODO: need to revirce
      });
      // chart.categories.reverse();
      /***
      here the chart is like:
      {
		categories: []   //x 
		series: [{
			data: []	//y
			name: ''	//line name
		}]
      }
      */
      json[key] = chart;
    });
    param.Statistic = {
    	'chart': json['dashboard']
    };

    render( (<Statistic {...param} />), document.querySelector('#dashboard-linechart') );

  });
});
