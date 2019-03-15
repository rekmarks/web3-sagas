
/* eslint-env jest */

import { put } from 'redux-saga/effects'
import { cloneableGenerator } from '@redux-saga/testing-utils'

import { web3 as ACTIONS } from '../src/actions'
import { reducer, initialState, addListeners, _test } from '../src/reducers/web3'

import EventEmitter from 'events'

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

  test(ACTIONS.CLEAR_ERRORS, () => {
    state.errors = [ new Error('blaha') ]
    state = reducer(state, _test.actions.getClearErrorsAction())
    expect(state).toMatchObject({ errors: [] })
  })

  test(ACTIONS.GET_WEB3_FAILURE, () => {
    const error = 'sune'
    state = reducer(state, _test.actions.getWeb3FailureAction(error))
    expect(state).toMatchObject({ errors: [error] })
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
})

describe('web3 sagas', () => {

  beforeEach(() => {
    window.ethereum = {
      isMetaMask: true,
      selectedAddress: 'bar',
      networkVersion: 9000,
    }
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
}
