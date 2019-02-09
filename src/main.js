
import '@babel/polyfill'

import { all } from 'redux-saga/effects'

import { sagas as web3Sagas } from './reducers/web3'
import { sagas as contractsSagas } from './reducers/contracts'

export default function * rootSaga () {
  yield all([
    web3Sagas.watchGetWeb3(),
    contractsSagas.watchDeploySaga(),
  ])
}
