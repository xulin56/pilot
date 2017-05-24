/**
 * Created by haitao on 17-5-15.
 */
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import DashboardContainer from './dashboard2/containers/DashboardContainer';
import configureStore from './dashboard2/store/configureStore';

const $ = window.$ = require('jquery');
const store = configureStore();

$(document).ready(() => {
    render(
        <Provider store={store}>
            <DashboardContainer />
        </Provider>,
        document.getElementById('dashboard')
    );
});
