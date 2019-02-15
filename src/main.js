
import '@babel/polyfill'

import { combineReducers } from 'redux'
import { all } from 'redux-saga/effects'

import web3Reducer, {
  sagas as web3Sagas,
  initialState as web3State,
} from './reducers/web3'

import contractsReducer, {
  sagas as contractsSagas,
  initialState as contractsState,
} from './reducers/contracts'

const initialState = {
  contracts: {...contractsState},
  web3: {...web3State},
}

const reducer = combineReducers({
  contractsReducer,
  web3Reducer,
})

function * saga () {
  yield all([
    web3Sagas.watchGetWeb3(),
    contractsSagas.watchDeploySaga(),
  ])
}

export default {
  saga,
  reducer,
  initialState,
}
