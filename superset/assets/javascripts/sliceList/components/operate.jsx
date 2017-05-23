import React, { Component } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
const $ = window.$ = require('jquery');
const _ = require('lodash');

class Operate {

    static params = {
        'order_column': '',
        'order_direction': '',
        'page': 0,
        'page_size': 10,
        'filter': '',
        'only_favorite': ''
    };

    constructor (options) {
        this.$all = $(options.btnAll);
        this.$fav = $(options.btnFav);

        this.params = _.merge({}, Operate.params );

        this.bindEvents();
    }

    bindEvents () {
        let me = this;

        let URL = location.origin+ '/slicemodelview/list/?';

        let switcher=(isFav) => {
            const param = _.merge( {}, me.params, {'only_favorite': isFav });
            let url = URL+ $.param(param);
            //$.get(url, function(){
            //    location.reload(false);
            //});
            location.href = url;
            return;
        }

        this.$all.on('click', function(e){
            switcher(false);
        })

        this.$fav.on('click', function(e){
            switcher(true);
        })

    }

    showAll () {
        console.log('show all');
    }

    showFav () {
        console.log('show fav');
    }

    render() {
        return `Operate`;
    }

}

export default Operate;


