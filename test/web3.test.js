
/* eslint-env jest */

import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { put } from 'redux-saga/effects'
import { cloneableGenerator } from '@redux-saga/testing-utils'
import EventEmitter from 'events'

import { web3 as ACTIONS } from '../src/actions'
import { reducer, initialState, addListeners, _test } from '../src/reducers/web3'
import selectors from '../src/selectors'


const cloneState = () => {
  return {
    web3: { ...initialState },
  }
}

describe('web3 reducer', () => {

  let state

  beforeEach(() => {
    state = { ...initialState }
  })

  test('Default', () => {
    state = reducer(state, { type: 'KAPLAHHH', foo: 'bar' })
    expect(state).toEqual(initialState)
  })

  test(ACTIONS.GET_WEB3, () => {
    state = { foo: 'bar' }
    state = reducer(state, _test.actions.getWeb3Action())
    expect(state).toEqual(initialState)
  })

  test(ACTIONS.GET_WEB3_SUCCESS, () => {
    const expected = {
      account: 'account',
      networkId: 'networkId',
    }
    state = reducer(state, { type: ACTIONS.GET_WEB3_SUCCESS, ...expected })
    expected.ready = true
    expect(state).toMatchObject(expected)
  })

  test(ACTIONS.GET_WEB3_FAILURE, () => {
    const error = 'sune'
    state = reducer(state, _test.actions.getWeb3FailureAction(error))
    expect(state).toMatchObject({ errors: [error] })
  })

  test(ACTIONS.WATCH_ASSET, () => {
    state = reducer(state, _test.actions.getWatchAssetAction())
    expect(state).toEqual(initialState)
  })

  test(ACTIONS.WATCH_ASSET_SUCCESS, () => {
    state = reducer(state, _test.actions.getWatchAssetSuccessAction())
    expect(state).toEqual(initialState)
  })

  test(ACTIONS.WATCH_ASSET_FAILURE, () => {
    const error = 'sune'
    state = reducer(state, _test.actions.getWatchAssetFailureAction(error))
    expect(state).toMatchObject({ errors: [error] })
  })

  test(ACTIONS.CLEAR_ERRORS, () => {
    state.errors = [ new Error('blaha') ]
    state = reducer(state, _test.actions.getClearErrorsAction())
    expect(state).toMatchObject({ errors: [] })
  })

})

describe('getWeb3 sagas', () => {

  beforeEach(() => {
    window.ethereum = new MockProvider()
  })

  const gen = cloneableGenerator(_test.sagas.getWeb3Saga)()

  test('Fails if window.ethereum not found', () => {
    const clone = gen.clone()
    window.ethereum = false
    expect(clone.next().value).toEqual(
      put(_test.actions.getWeb3FailureAction(
        new Error('window.ethereum not found.')
      ))
    )
  })

  test('Fails if account address invalid', () => {
    const clone = gen.clone()
    window.ethereum.selectedAddress = null
    expect(clone.next().value).toEqual(
      put(_test.actions.getWeb3FailureAction(
        new Error('Missing or invalid account or network id.')
      ))
    )
  })

  test('Fails if network id invalid', () => {
    const clone = gen.clone()
    window.ethereum.networkVersion = null
    expect(clone.next().value).toEqual(
      put(_test.actions.getWeb3FailureAction(
        new Error('Missing or invalid account or network id.')
      ))
    )
  })

  test('Succeeds if all is well', () => {
    expect(gen.next().value).toEqual(
      put(_test.actions.getWeb3SuccessAction(
        window.ethereum.selectedAddress,
        window.ethereum.networkVersion
      ))
    )
  })
})

describe('watchAsset sagas', () => {

  let state
  const tokenAddress = '0xabc'
  const watchAssetAction = _test.actions.getWatchAssetAction(tokenAddress)

  beforeEach(() => {
    window.ethereum = new MockProvider()
    state = cloneState()
  })

  test('Fails if web3 reducer not ready', () => {

    state.web3.ready = false

    return expectSaga(_test.sagas.watchAssetSaga, watchAssetAction)
      .withState(state)
      .select(selectors.web3)
      .put(
        _test.actions.getWatchAssetFailureAction(
          new Error('Web3 reducer not ready.')
        )
      )
      .run()
  })

  test('Handles success', () => {

    state.web3.ready = true

    return expectSaga(_test.sagas.watchAssetSaga, watchAssetAction)
      .withState(state)
      .select(selectors.web3)
      .provide([
        [matchers.call.fn(window.ethereum.sendAsync), { added: true }],
      ])
      .put(
        _test.actions.getWatchAssetSuccessAction(tokenAddress)
      )
      .run()
  })

  test('Handles failure', () => {

    state.web3.ready = true

    return expectSaga(_test.sagas.watchAssetSaga, watchAssetAction)
      .withState(state)
      .select(selectors.web3)
      .provide([
        [
          matchers.call.fn(window.ethereum.sendAsync),
          { added: false, error: new Error('sune') },
        ],
      ])
      .put(
        _test.actions.getWatchAssetFailureAction(new Error('sune'))
      )
      .run()
  })
})

describe('web3 listeners', () => {

  beforeEach(() => {
    window.ethereum = new MockProvider()
  })

  test('Handles accountsChanged', () => {
    let result = null
    addListeners(action => { result = action })
    window.ethereum.changeAccounts()
    expect(result).toEqual(_test.actions.getWeb3Action())
  })

  test('Handles networkChanged', () => {
    let result = null
    addListeners(action => { result = action })
    window.ethereum.changeNetwork()
    expect(result).toEqual(_test.actions.getWeb3Action())
  })
})

class MockProvider extends EventEmitter {

  isMetaMask = true
  selectedAddress = 'bar'
  networkVersion = 9000

  changeAccounts = () => {
    this.emit('accountsChanged', 'foo')
  }

  changeNetwork = () => {
    this.emit('networkChanged', 9001)
  }

  sendAsync = () => true
}
