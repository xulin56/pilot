import React, { Component } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
const $ = window.$ = require('jquery');

class Operate {

    constructor (options) {
        console.log(options);


    }

    showAll () {
        console.log('show all');
    }

    showFav () {
        console.log('show fav');
    }

}

export default Operate;


