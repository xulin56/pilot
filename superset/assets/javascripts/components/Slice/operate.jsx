import React from 'react';
import { render } from 'react-dom';

const $ = window.$ = require('jquery');

$(function(){
    let url = '/slicemodelview/listJson/';

    $.getJSON(url, function (data) {
        const store = window.localStorage;
        console.log( 'data is:', data);
    });

});