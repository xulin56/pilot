import { combineReducers } from 'redux';
import {
  NAVIGATE_TO,
  REQUEST_POSTS, RECEIVE_POSTS,
} from '../actions';

function selectedReddit(state = {
  pageNumber: 1,    //page=0
  pageSize: 20,     //page_size=20
  // defaultPageSize: 20,    //only used default
  // // orderColumn: //TODO
  orderDirection: 'desc',
  // filter: '',
  onlyFavorite: 0

  // listData params :
  // page=0&page_size=10 &order_column=changed_on&order_direction=desc 
  // &filter=hive&only_favorite=0
}, action) {
  switch (action.type) {
    case NAVIGATE_TO:
      return Object.assign({}, state, {
        pageNumber: action.pageNumber
      });
      
    // case FILTER:
    //   return Object.assign({}, state, {
    //     pageNumber: action.pageNumber
    //   }); 
    default:
      return state;
  }
}

function posts(state = {
  isFetching: false,
  items: [],
}, action) {
  switch (action.type) {
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_POSTS:
      return Object.assign({}, state, {
        isFetching: false,
        items: action.posts,
        lastUpdated: action.receivedAt,
      });
    default:
      return state;
  }
}

function postsBypageNumber(state = { }, action) {
  switch (action.type) {
    case RECEIVE_POSTS:
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        [action.pageNumber]: posts(state[action.pageNumber], action),
      });
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  postsBypageNumber,
  selectedReddit,
});

export default rootReducer;
