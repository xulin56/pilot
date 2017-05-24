import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';


import App from './sliceList/containers/SliceConnection';
import configureStore from './sliceList/stores/configureStore';

const store = configureStore();

import 'antd/dist/antd.css';

const $ = require('jquery');


	
	const rootElement = document.querySelector('#slices');
	console.log(rootElement);

    render(
      <Provider store={store}>
        <App />
      </Provider>,
      rootElement
    );
