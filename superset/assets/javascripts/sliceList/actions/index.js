import fetch from 'isomorphic-fetch';
import { getAbsUrl } from '../utils';

export const REQUEST_POSTS = 'REQUEST_POSTS';
export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export const NAVIGATE_TO = 'NAVIGATE_TO';

export function navigateTo(pageNumber){
  return {
    pageNumber,
    type: NAVIGATE_TO
  }
}

function requestPosts(pageNumber) {
  return {
    type: REQUEST_POSTS,
    pageNumber,
  };
}

function receivePosts(pageNumber, json) {
  return {
    type: RECEIVE_POSTS,
    pageNumber,
    dataSource: json, //.data.children.map(child => child.data),
    receivedAt: Date.now()
  };
}

function fetchPosts(pageNumber) {
  return dispatch => {
    dispatch(requestPosts(pageNumber));
    const url = window.location.origin + "/slicemodelview/listdata/";

    return fetch(url, {
        credentials: 'include',
        method: 'GET'
      })
      .then(response => {
        if(response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(response => {

        let dataSource = [];
        response.data.forEach(function(slice, index) {
          let obj = {};
          obj.key = index + 1;
          obj.name = slice.slice_name;
          obj.type = slice.viz_type;
          obj.set = slice.datasource;
          obj.owner = slice.created_by_user;
          obj.state = slice.online;
          obj.time = slice.changed_on;
          dataSource.push(obj);
        });
        
        dispatch(receivePosts(pageNumber, dataSource ));
      });
  };

}

function shouldFetchPosts(state, pageNumber) {
  const posts = state.postsBypageNumber[pageNumber];
  if (!posts) {
    return true;
  }
  if (posts.isFetching) {
    return false;
  }
  return posts.didInvalidate;
}

export function fetchPostsIfNeeded(pageNumber) {
  return (dispatch, getState) => {
    if (shouldFetchPosts(getState(), pageNumber)) {
      return dispatch(fetchPosts(pageNumber));
    }
    return null;
    // return dispatch(fetchPosts(pageNumber));

  };
}
