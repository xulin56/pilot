import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import switcher from './reducers';

// import Statistic from './containers/Statistic/Statistic';
import {  Home } from './containers';

const $ = window.$ = require('jquery');


$(function(){
console.log('fuck you ')
});