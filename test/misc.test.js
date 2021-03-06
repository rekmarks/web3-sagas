
/* eslint-env jest */

import uuidv5 from 'uuid/v5'

import { sagas, reducers, initialState, NAMESPACE } from '../index.js'
import { contracts } from 'chain-end'

describe('namespace', () => {

  it('namespace and contract bytecode produces deterministic v5 uuids', () => {
    const id = uuidv5(contracts.StandardERC20.bytecode, NAMESPACE)
    expect(id).toEqual(uuidv5(contracts.StandardERC20.bytecode, NAMESPACE))
  })
})

describe('index.min.js', () => {

  it('properties exported correctly', () => {
    expect(sagas.length).toEqual(3)
    expect(Object.keys(reducers).length).toEqual(2)
    expect(Object.keys(initialState).length).toEqual(2)
  })
})
