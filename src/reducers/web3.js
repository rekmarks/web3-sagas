
// package imports

import { put, select, takeEvery, takeLatest } from 'redux-saga/effects'

// local imports

import { web3 as ACTIONS } from '../actions'
import selectors from '../selectors'
import { createPromise } from '../utils'

const initialState = {
  account: null, // current selected account from injected web3 object
  networkId: null, // current selected network id from injected web3 object
  ready: false, // false on start or if any thunks have yet to return, true o.w.
  errors: [], // storage for web3 errors
}

const sagas = [
  takeLatest(ACTIONS.GET_WEB3, getWeb3Saga),
  takeEvery(ACTIONS.WATCH_ASSET, watchAssetSaga),
]

const _test = {
  actions: {
    getWeb3Action,
    getWeb3FailureAction,
    getWeb3SuccessAction,
    getWatchAssetAction,
    getWatchAssetSuccessAction,
    getWatchAssetFailureAction,
    getClearErrorsAction,
  },
  sagas: {
    watchGetWeb3,
    watchWatchAsset,
    getWeb3Saga,
    watchAssetSaga,
  },
}

export {
  initialState,
  sagas,
  reducer,
  addListeners,
  // actions
  getWeb3Action as getWeb3,
  getWatchAssetAction as watchAsset,
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

    case ACTIONS.WATCH_ASSET:
      return state

    case ACTIONS.WATCH_ASSET_SUCCESS:
      return state

    case ACTIONS.WATCH_ASSET_FAILURE:
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
 * Makes wallet_watchAsset call.
 * @param {string} address the token contract address
 * @param {string} symbol the token's symbol
 * @param {number} address the token's decimals
 */
function getWatchAssetAction (address, symbol, decimals) {
  return {
    type: ACTIONS.WATCH_ASSET,
    address,
    symbol,
    decimals,
  }
}

/**
 * On watchAsset success, can be used to notify user.
 * @param {string} address the address of the added token
 */
function getWatchAssetSuccessAction (address, symbol) {
  return {
    type: ACTIONS.WATCH_ASSET_SUCCESS,
    address,
    symbol,
  }
}

/**
 * On watchAsset failure, adds error to state.
 * @param {error} error
 */
function getWatchAssetFailureAction (error) {
  return {
    type: ACTIONS.WATCH_ASSET_FAILURE,
    error,
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
 * watchAssetSaga watcher
 */
function * watchWatchAsset () {
  yield takeEvery(ACTIONS.WATCH_ASSET, watchAssetSaga)
}

/**
 * Attempts to add the ERC20 token with the address given by the action.
 * @param {object} action a WATCH_ASSET action
 */
function * watchAssetSaga (action) {

  const web3 = yield select(selectors.web3)

  if (!web3.ready) {
    yield put(getWatchAssetFailureAction(
      new Error('Web3 reducer not ready.')
    ))
  } else {

    // sendAsync uses callbacks, and we need to use promises because
    // this is a generator (when EIP1193 is adopted, this will be simpler)
    const promise = createPromise(
      window.ethereum.sendAsync,
      {
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: action.address,
            symbol: action.symbol,
            decimals: action.decimals,
          },
        },
      }
    )
    const resolved = yield promise

    if (!resolved.error && !resolved.result.error) {
      yield put(getWatchAssetSuccessAction(action.address, action.symbol))
    } else {
      yield put(getWatchAssetFailureAction(
        resolved.error || resolved.result.error
      ))
    }
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
  if (!window.ethereum) throw 'window.ethereum not found; make sure you check that window.ethereum is injected before calling store.addListeners'
  window.ethereum.on('accountsChanged', () => {
    dispatch(getWeb3Action())
    if (actions.accountsChanged) dispatch(actions.accountsChanged)
  })
  window.ethereum.on('networkChanged', () => {
    dispatch(getWeb3Action())
    if (actions.networkChanged) dispatch(actions.networkChanged)
  })
}
