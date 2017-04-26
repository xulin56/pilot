import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import switcher from './reducers';

// import Statistic from './containers/Statistic/Statistic';
import {  Home } from './containers';

import { loadStatistic } from './actions/statistic';
import { Table } from './components/home';

const $ = window.$ = require('jquery');
const _ = require('lodash');
/* eslint no-unused-vars: 0 */
// const jQuery = window.jQuery = $;


const store = createStore(switcher);

$(function () {
  let url = '/home';
  let json = {};
  let chart = {};
  let dataArr = [];
  let param = {};
  let swip = {};
  param.statistic = {};
  
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
      	data: dataArr
      });


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

    param.statistic.chart = json['dashboard'];
    json = {};

    _.forEach( data.index.edits, (arr, key) =>{

      json[key] = {};
      dataArr = [];

      _.forEach( arr, (obj, key) =>{
        swip = {
          'name': obj.link,
          'time': obj.time
          // ,'user': obj.user
        };
        dataArr.push(swip);
      });
      json[key] = dataArr;
    });

    param.statistic.tables = json;
    param.actions = data.index.actions;
    param.counts = data.index.counts;

    // param.statistic = {
    // 	'chart': json['dashboard']
    // };

    // render( <Home {...param} />, document.querySelector('#home'));

    function renderHome() {
      render(
        <Home
          param = {param}
          state = {store.getState()}
          switchLatestEdits = {(action) => {
            store.dispatch(action);
          }}
          switchFavorites = {(action) => {
            store.dispatch(action);
          }}
        />, document.querySelector('#home'));
    }

    renderHome();
    store.subscribe(renderHome);

  });
});
