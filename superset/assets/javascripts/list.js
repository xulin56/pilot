import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Operate } from './components/Slice';
import { DashboardEdit, SliceEdit } from './components/popup';

const $ = window.$ = require('jquery');

$(".edit-popup-dashboard").on('click',function () {
    var popupElDashboard = render(<DashboardEdit />, document.getElementById('popup_root'));
	if(popupElDashboard) {
        popupElDashboard.showDialog();
	}
});

$(".edit-popup-slice").on('click',function () {
    var popupElSlice = render(<SliceEdit />, document.getElementById('popup_root'));
    if(popupElSlice) {
        popupElSlice.showDialog();
    }
});

$(function(){
    let url = '/slicemodelview/listJson/';
//    const $all = $('#j_all');
//    const $fav = $('#j_fav')
//    const $search = $('#j_search');

    const operate = new Operate({
        btnAll: '.j_all',
        btnFav: '.j_fav',
        form: '.j_searchForm'
    });


//    $.getJSON(url, function (response) {

//        let table = render( <Operate {...response.data}  />, document.querySelector('.table-responsive') );

//        console.log('Operate:', operate.fetchOptions() );
//    });

});
