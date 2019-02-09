
// package imports

import { put, takeLatest } from 'redux-saga/effects'

// local imports

import { web3 as ACTIONS } from '../actions'

const initialState = {
  account: null, // current selected account from injected web3 object
  networkId: null, // current selected network id from injected web3 object
  provider: null, // current provider from injected web3 object
  ready: false, // false on start or if any thunks have yet to return, true o.w.
  errors: [], // storage for web3 errors
}

const sagas = {
  watchGetWeb3,
}

const _test = {
  actions: {
    getWeb3Action,
    getWeb3FailureAction,
    getWeb3SuccessAction,
    getClearErrorsAction,
  },
  sagas: {
    getWeb3Saga,
    watchGetWeb3,
  },
}

export {
  getWeb3Action as getWeb3,
  getClearErrorsAction as clearErrors,
  initialState,
  sagas,
  _test,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.GET_WEB3:
      return {
        ...initialState,
      }

    case ACTIONS.GET_WEB3_SUCCESS:
      return {
        ...state,
        ready: true,
        provider: action.provider,
        account: action.account,
        networkId: action.networkId,
      }

    case ACTIONS.GET_WEB3_FAILURE:
      return {
        ...state,
        errors: state.errors.concat(action.error),
      }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: [],
      }

    default:
      return state
  }
}

/**
 * Synchronous action creators
 */

function getWeb3Action () {
  return {
    type: ACTIONS.GET_WEB3,
  }
}

function getWeb3SuccessAction (provider, account, networkId) {
  return {
    type: ACTIONS.GET_WEB3_SUCCESS,
    provider: provider,
    account: account,
    networkId: networkId,
  }
}

function getWeb3FailureAction (error) {
  return {
    type: ACTIONS.GET_WEB3_FAILURE,
    error: error,
  }
}

function getClearErrorsAction () {
  return {
    type: ACTIONS.CLEAR_ERRORS,
  }
}

/**
 * Sagas
 */

/**
 * Saga export for use in root Saga.
 */
function * watchGetWeb3 () {
  yield takeLatest(ACTIONS.GET_WEB3, getWeb3Saga)
}

/**
 * Saga. Gets the injected web3 object. Assumes window.ethereum.enable()
 * already called. Does not support legacy dapp browsers.
 *
 * TODO: Add support for other EIP1102-compliant dapp browsers.
 */
function * getWeb3Saga () {

  let provider, account, networkId

  // attempt to get ethereum object injected by MetaMask
  // TODO: let other dapp browsers through, but add a warning in the UI
  if (window.ethereum && window.ethereum.isMetaMask) {

    try {
      // Request account access if needed
      provider = window.ethereum
      account = window.ethereum.selectedAddress
      networkId = window.ethereum.networkVersion
    } catch (error) {
      // User denied access
      yield put(getWeb3FailureAction(error))
    }
  } else {
    console.warn('Please install MetaMask.')
    yield put(getWeb3FailureAction(new Error('window.ethereum not found.')))
  }

  // fail if account invalid
  if (!account || account.length < 1 || !networkId) {
    yield put(getWeb3FailureAction(new Error(
      'Missing or invalid account or network id.', account)))
  } else {
    yield put(getWeb3SuccessAction(provider, account, networkId))
  }
}
