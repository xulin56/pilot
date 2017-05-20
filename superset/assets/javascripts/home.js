import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './home/store/configureStore';
import { Home } from './home/containers';
import 'babel-polyfill';

const _ = require('lodash');
/* eslint no-unused-vars: 0 */
// const jQuery = window.jQuery = $;

const store = configureStore();

render(
    <Provider store={store}>
      <Home />
    </Provider>,
    document.querySelector('#home')
);
