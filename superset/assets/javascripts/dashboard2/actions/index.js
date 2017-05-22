/**
 * Created by haitao on 17-5-18.
 */
import fetch from 'isomorphic-fetch';

export const ADD_SLICE = 'ADD_SLICE';
export const EDIT_SLICE = 'EDIT_SLICE';
export const PUBLIC_SLICE = 'PUBLIC_SLICE';
export const DELETE_SLICE = 'DELETE_SLICE';

export const GET_SLICE_LIST = 'GET_SLICE_LIST';

export function addSliceAction() {
    return {
        type: ADD_SLICE,
    }
}

export function editSliceAction() {
    return {
        type: EDIT_SLICE,
    }
}

export function publishSliceAction() {
    return {
        type: PUBLIC_SLICE,
    }
}

export function deleteSliceAction() {
    return {
        type: DELETE_SLICE,
    }
}

export function getSliceListAction(json) {
    return {
        type: GET_SLICE_LIST,
        data: json.data,
    }
}

export function fetchSliceListPromise(url) {
    return dispatch => {
        return fetch(url, {
            credentials: "same-origin"
        }).then(response => response.json())
            .then(json => dispatch(getSliceListAction(json)))
    }
}