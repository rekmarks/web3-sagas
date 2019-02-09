
/* eslint-env jest */

import { call, put, take } from 'redux-saga/effects'
import { cloneableGenerator } from '@redux-saga/testing-utils'

import { contracts as ACTIONS } from '../src/actions'
import reducer, { initialState, _test } from '../src/reducers/contracts'

describe('contracts reducer', () => {

  let state

  beforeEach(() => {
    state = { ...initialState }
  })

  it(ACTIONS.CLEAR_ERRORS, () => {
    state.errors = [ new Error('blaha') ]
    state = reducer(state, _test.actions.getClearErrorsAction())
    expect(state).toMatchObject({ errors: [] })
  })

  it('Default', () => {
    state = reducer(state, { type: 'KAPLAHHH', foo: 'bar' })
    expect(state).toEqual(initialState)
  })
})
