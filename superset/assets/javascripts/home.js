import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter, Route, Link, IndexRoute } from 'react-router-dom';
import configureStore from './home/store/configureStore';
import { Home, EditDetail, EventDetail} from './home/containers';
import { App } from './home/components';
import 'babel-polyfill';

const _ = require('lodash');

const store = configureStore();

render(
    <Provider store={store}>
        <HashRouter>
            <div>
                <Route exact path="/" component={Home} />
                <Route path="/editDetail" component={EditDetail} />
                <Route path="/eventDetail" component={EventDetail} />
            </div>
        </HashRouter>
    </Provider>,
    document.querySelector('#home')
);


