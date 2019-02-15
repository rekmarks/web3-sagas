"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWeb3 = getWeb3Action;
exports.clearErrors = getClearErrorsAction;
exports.default = reducer;
exports._test = exports.sagas = exports.initialState = void 0;

var _effects = require("redux-saga/effects");

var _actions = require("../actions");

// package imports
// local imports
const initialState = {
  account: null,
  // current selected account from injected web3 object
  networkId: null,
  // current selected network id from injected web3 object
  provider: null,
  // current provider from injected web3 object
  ready: false,
  // false on start or if any thunks have yet to return, true o.w.
  errors: [] // storage for web3 errors

};
exports.initialState = initialState;
const sagas = [(0, _effects.takeLatest)(_actions.web3.GET_WEB3, getWeb3Saga)];
exports.sagas = sagas;
const _test = {
  actions: {
    getWeb3Action,
    getWeb3FailureAction,
    getWeb3SuccessAction,
    getClearErrorsAction
  },
  sagas: {
    getWeb3Saga,
    watchGetWeb3
  }
};
exports._test = _test;

function reducer(state = initialState, action) {
  switch (action.type) {
    case _actions.web3.GET_WEB3:
      return { ...initialState
      };

    case _actions.web3.GET_WEB3_SUCCESS:
      return { ...state,
        ready: true,
        provider: action.provider,
        account: action.account,
        networkId: action.networkId
      };

    case _actions.web3.GET_WEB3_FAILURE:
      return { ...state,
        errors: state.errors.concat(action.error)
      };

    case _actions.web3.CLEAR_ERRORS:
      return { ...state,
        errors: []
      };

    default:
      return state;
  }
}
/**
 * Synchronous action creators
 */

/**
 * Gets web3, adds it to state.
 */


function getWeb3Action() {
  return {
    type: _actions.web3.GET_WEB3
  };
}
/**
 * On getWeb3 success, adds provider, account, and networkId to state.
 * @param {object} provider
 * @param {string} account
 * @param {string} networkId
 */


function getWeb3SuccessAction(provider, account, networkId) {
  return {
    type: _actions.web3.GET_WEB3_SUCCESS,
    provider,
    account,
    networkId
  };
}
/**
 * On getWeb3 failure, adds error to state.
 * @param {error} error
 */


function getWeb3FailureAction(error) {
  return {
    type: _actions.web3.GET_WEB3_FAILURE,
    error
  };
}
/**
 * Clears errors from state.
 */


function getClearErrorsAction() {
  return {
    type: _actions.web3.CLEAR_ERRORS
  };
}
/**
 * Sagas
 */

/**
 * Watcher for getWeb3Saga.
 */


function* watchGetWeb3() {
  yield (0, _effects.takeLatest)(_actions.web3.GET_WEB3, getWeb3Saga);
}
/**
 * Saga. Gets the injected web3 object. Assumes window.ethereum.enable()
 * already called. Does not support legacy dapp browsers.
 *
 * TODO: Add support for other EIP1102-compliant dapp browsers.
 */


function* getWeb3Saga() {
  let provider, account, networkId; // attempt to get ethereum object injected by MetaMask
  // TODO: let other dapp browsers through, but add a warning in the UI

  if (window.ethereum && window.ethereum.isMetaMask) {
    try {
      // Request account access if needed
      provider = window.ethereum;
      account = window.ethereum.selectedAddress;
      networkId = window.ethereum.networkVersion;
    } catch (error) {
      // User denied access
      yield (0, _effects.put)(getWeb3FailureAction(error));
    }
  } else {
    console.warn('Please install MetaMask.');
    yield (0, _effects.put)(getWeb3FailureAction(new Error('window.ethereum not found.')));
  } // fail if account invalid


  if (!account || account.length < 1 || !networkId) {
    yield (0, _effects.put)(getWeb3FailureAction(new Error('Missing or invalid account or network id.', account)));
  } else {
    yield (0, _effects.put)(getWeb3SuccessAction(provider, account, networkId));
  }
}