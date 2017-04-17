import { ASYNC } from 'redux-amrc';
export const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
export const DECREMENT_COUNTER = 'DECREMENT_COUNTER';
import 'isomorphic-fetch';

function handle401(res) {
  if (res.status === 401 && !__SERVER__) {
    window.location.reload();
  }
  return res;
}

function handleErrors(res) {
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}

const customFetch = (url, option) => {
  const prefix = __SERVER__ ? 'http://' + config.apiHost + ':' + config.apiPort : '/api';

  let opt = option || {};
  if (__SERVER__) {
    opt = {
      ...opt,
      headers: {
        ...opt.headers,
        cookie: __COOKIE__
      }
    };
  } else {
    opt = {
      ...opt,
      credentials: 'same-origin'
    };
  }

  return fetch(prefix + url, opt)
    .then(handle401)
    .then(handleErrors);
}




export function increment() {
  return {
    type: INCREMENT_COUNTER
  };
}

export function decrement() {
  return {
    type: DECREMENT_COUNTER
  };
}

export function incrementIfOdd() {
  return (dispatch, getState) => {
    const { async } = getState();

    if (async.counter.value % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}

export function incrementAsync(delay = 1000) {
  return dispatch => {
    setTimeout(() => {
      dispatch(increment());
    }, delay);
  };
}

export function loadCounter() {
  return {
    [ASYNC]: {
      key: 'counter',
      promise: () => customFetch('/counter')
    }
  };
}
