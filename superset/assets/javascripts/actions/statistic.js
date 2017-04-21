import { ASYNC } from 'redux-amrc';
import 'isomorphic-fetch';

function handle401(res) {
  if (res.status === 401) {
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

  let opt = option || {};
  opt = {
    ...opt,
    credentials: 'same-origin'
  };

  return fetch (url, opt)
    .then(handle401)
    .then(handleErrors);
}

export function loadStatistic() {
  return {
    [ASYNC]: {
      key: 'statistic',
      promise: () => customFetch('/home')
    }
  };
}