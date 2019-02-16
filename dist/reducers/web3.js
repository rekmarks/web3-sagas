"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWeb3 = getWeb3Action;
exports.clearErrors = getClearErrorsAction;
exports.default = reducer;
exports._test = exports.sagas = exports.initialState = void 0;

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("regenerator-runtime/runtime");

var _effects = require("redux-saga/effects");

var _actions = require("../actions");

var _marked =
/*#__PURE__*/
regeneratorRuntime.mark(watchGetWeb3),
    _marked2 =
/*#__PURE__*/
regeneratorRuntime.mark(getWeb3Saga);

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initialState = {
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
var sagas = [(0, _effects.takeLatest)(_actions.web3.GET_WEB3, getWeb3Saga)];
exports.sagas = sagas;
var _test = {
  actions: {
    getWeb3Action: getWeb3Action,
    getWeb3FailureAction: getWeb3FailureAction,
    getWeb3SuccessAction: getWeb3SuccessAction,
    getClearErrorsAction: getClearErrorsAction
  },
  sagas: {
    getWeb3Saga: getWeb3Saga,
    watchGetWeb3: watchGetWeb3
  }
};
exports._test = _test;

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case _actions.web3.GET_WEB3:
      return _objectSpread({}, initialState);

    case _actions.web3.GET_WEB3_SUCCESS:
      return _objectSpread({}, state, {
        ready: true,
        provider: action.provider,
        account: action.account,
        networkId: action.networkId
      });

    case _actions.web3.GET_WEB3_FAILURE:
      return _objectSpread({}, state, {
        errors: state.errors.concat(action.error)
      });

    case _actions.web3.CLEAR_ERRORS:
      return _objectSpread({}, state, {
        errors: []
      });

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
    provider: provider,
    account: account,
    networkId: networkId
  };
}
/**
 * On getWeb3 failure, adds error to state.
 * @param {error} error
 */


function getWeb3FailureAction(error) {
  return {
    type: _actions.web3.GET_WEB3_FAILURE,
    error: error
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


function watchGetWeb3() {
  return regeneratorRuntime.wrap(function watchGetWeb3$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _effects.takeLatest)(_actions.web3.GET_WEB3, getWeb3Saga);

        case 2:
        case "end":
          return _context.stop();
      }
    }
  }, _marked, this);
}
/**
 * Saga. Gets the injected web3 object. Assumes window.ethereum.enable()
 * already called. Does not support legacy dapp browsers.
 *
 * TODO: Add support for other EIP1102-compliant dapp browsers.
 */


function getWeb3Saga() {
  var provider, account, networkId;
  return regeneratorRuntime.wrap(function getWeb3Saga$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(window.ethereum && window.ethereum.isMetaMask)) {
            _context2.next = 13;
            break;
          }

          _context2.prev = 1;
          // Request account access if needed
          provider = window.ethereum;
          account = window.ethereum.selectedAddress;
          networkId = window.ethereum.networkVersion;
          _context2.next = 11;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](1);
          _context2.next = 11;
          return (0, _effects.put)(getWeb3FailureAction(_context2.t0));

        case 11:
          _context2.next = 16;
          break;

        case 13:
          console.warn('Please install MetaMask.');
          _context2.next = 16;
          return (0, _effects.put)(getWeb3FailureAction(new Error('window.ethereum not found.')));

        case 16:
          if (!(!account || account.length < 1 || !networkId)) {
            _context2.next = 21;
            break;
          }

          _context2.next = 19;
          return (0, _effects.put)(getWeb3FailureAction(new Error('Missing or invalid account or network id.', account)));

        case 19:
          _context2.next = 23;
          break;

        case 21:
          _context2.next = 23;
          return (0, _effects.put)(getWeb3SuccessAction(provider, account, networkId));

        case 23:
        case "end":
          return _context2.stop();
      }
    }
  }, _marked2, this, [[1, 7]]);
}
//# sourceMappingURL=web3.js.map