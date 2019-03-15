
// package imports

import { put, takeLatest } from 'redux-saga/effects'

// local imports

import { web3 as ACTIONS } from '../actions'

const initialState = {
  account: null, // current selected account from injected web3 object
  networkId: null, // current selected network id from injected web3 object
  ready: false, // false on start or if any thunks have yet to return, true o.w.
  errors: [], // storage for web3 errors
}

const sagas = [
  takeLatest(ACTIONS.GET_WEB3, getWeb3Saga),
]

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
  initialState,
  sagas,
  reducer,
  addListeners,
  // actions
  getWeb3Action as getWeb3,
  getClearErrorsAction as clearErrors,
  _test,
}

function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.GET_WEB3:
      return {
        ...initialState,
      }

    case ACTIONS.GET_WEB3_SUCCESS:
      return {
        ...state,
        ready: true,
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

/**
 * Gets web3, adds it to state.
 */
function getWeb3Action () {
  return {
    type: ACTIONS.GET_WEB3,
  }
}

/**
 * On getWeb3 success, adds account and networkId to state.
 * @param {string} account
 * @param {string} networkId
 */
function getWeb3SuccessAction (account, networkId) {
  return {
    type: ACTIONS.GET_WEB3_SUCCESS,
    account,
    networkId,
  }
}

/**
 * On getWeb3 failure, adds error to state.
 * @param {error} error
 */
function getWeb3FailureAction (error) {
  return {
    type: ACTIONS.GET_WEB3_FAILURE,
    error,
  }
}

/**
 * Clears errors from state.
 */
function getClearErrorsAction () {
  return {
    type: ACTIONS.CLEAR_ERRORS,
  }
}

/**
 * Sagas
 */

/**
 * Watcher for getWeb3Saga.
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

  let account, networkId

  // attempt to get ethereum object injected by MetaMask
  // TODO: let other dapp browsers through, but add a warning in the UI
  if (window.ethereum && window.ethereum.isMetaMask) {

    try {
      // Request account access if needed
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
    yield put(getWeb3SuccessAction(account, networkId))
  }
}

/**
 * Web3 Provider Listeners
 */

/**
 * Adds event listeners that dispatch the given action upon account or network
 * change. Only compatible with MetaMask.
 *
 * GET_WEB3 is always dispatched to keep state in sync with window.ethereum.
 * State is kept in sync for debugging purposes.
 *
 * Use actions argument to pass in additional actions to dispatch, by setting
 * its accountsChanged and networkChanged properties.
 *
 * @param {function} dispatch the store's dispatch function
 * @param {object} actions custom actions to dispatch in addition to GET_WEB3
 */
function addListeners (dispatch, actions = {}) {
  window.ethereum.on('accountsChanged', () => {
    dispatch(getWeb3Action())
    if (actions.accountsChanged) dispatch(actions.accountsChanged)
  })
  window.ethereum.on('networkChanged', () => {
    dispatch(getWeb3Action())
    if (actions.networkChanged) dispatch(actions.networkChanged)
  })
}
