/**
 * Created by haitao on 17-5-18.
 */
import { combineReducers } from 'redux';
import { ADD_SLICE, EDIT_SLICE, PUBLISH_SLICE, DELETE_SLICE } from '../actions';

function sliceOperation(state = { }, action) {
    switch (action.type) {
        case "ADD_SLICE":
            break;
        case "EDIT_SLICE":
            break;
        case "PUBLIC_SLICE":
            break;
        case "DELETE_SLICE":
            break;
        case "GET_SLICE_LIST":
            return Object.assign({}, state, {
                listData: action.data
            });
            break;
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    sliceOperation,

});

export default rootReducer;