
/* eslint-env jest */

import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import uuidv4 from 'uuid/v4'
import uuidv5 from 'uuid/v5'

import { contracts as ACTIONS } from '../src/actions'
import selectors from '../src/selectors'
import { reducer, initialState, _test } from '../src/reducers/contracts'
import { initialState as web3InitialState} from '../src/reducers/web3'
import { NAMESPACE, addInitialContractType } from '../index'

// TODO: finish testing all saga branches

const cloneState = () => {
  return {
    contracts: { ...initialState },
    web3: { ...web3InitialState },
  }
}

describe('contracts reducer', () => {

  let state

  beforeEach(() => {
    state = { ...initialState }
  })

  test('Default', () => {
    state = reducer(state, { type: 'KAPLAHHH', foo: 'bar' })
    expect(state).toEqual(initialState)
  })

  test('Add initial contract type', () => {
    const mockArtifact = { contractName: 'ERC20', bytecode: 'xyz' }
    const mockId = uuidv5(mockArtifact.bytecode, NAMESPACE)

    addInitialContractType(state, mockArtifact)

    expect(state).toEqual({
      ...initialState,
      types: {
        [mockId]: {
          id: mockId,
          name: 'ERC20',
          artifact: mockArtifact,
        },
      },
    })
  })

  test(ACTIONS.CLEAR_ERRORS, () => {
    state.errors = [ new Error('blaha') ]
    state = reducer(state, _test.actions.getClearErrorsAction())
    expect(state).toMatchObject({ errors: [] })
  })

  test(ACTIONS.BEGIN_DEPLOYMENT, () => {
    state.isDeploying = false
    state = reducer(state, _test.actions.getBeginDeploymentAction())
    expect(state).toEqual({ ...initialState, isDeploying: true })
  })

  test(ACTIONS.DEPLOYMENT_FAILURE, () => {
    state = reducer(state, _test.actions.getDeploymentFailureAction(
      new Error('foo')
    ))
    expect(state).toEqual({
      ...initialState, isDeploying: false, errors: [new Error('foo')],
    })
  })

  test(ACTIONS.DEPLOYMENT_SUCCESS, () => {
    const id1 = uuidv4()
    const id2 = uuidv4()
    state.instances = { [id1]: { id: id1, contract: 'foo' } }
    state = reducer(state, _test.actions.getDeploymentSuccessAction(
      id2, { contract: 'bar' }
    ))
    expect(state).toEqual({
      ...initialState,
      instances: {
        [id1]: { id: id1, contract: 'foo' },
        [id2]: { id: id2, contract: 'bar' },
      },
      isDeploying: false,
    })
  })

  test(ACTIONS.ADD_CONTRACT_TYPE, () => {

    const mockTypes = { 'abc': { id: 'abc' }, 'efg': { id: 'efg' } }
    const mockArtifact = { contractName: 'ERC20', bytecode: 'xyz' }
    const mockId = uuidv5(mockArtifact.bytecode, NAMESPACE)

    state.types = { ...mockTypes }

    const expectedState = {
      ...state,
      types: {
        ...state.types,
        [mockId]: {
          id: mockId,
          name: 'ERC20',
          artifact: mockArtifact,
        },
      },
    }

    state = reducer(
      state,
      _test.actions.getAddContractTypeAction(mockArtifact)
    )
    expect(state).toEqual(expectedState)

    // and again (should overwrite)
    state = reducer(
      state,
      _test.actions.getAddContractTypeAction(mockArtifact)
    )
    expect(state).toEqual(expectedState)
  })

  test(ACTIONS.REMOVE_CONTRACT_TYPE, () => {

    state.types = { 'abc': { id: 'abc' }, 'efg': { id: 'efg' } }
    state = reducer(state, _test.actions.getRemoveContractTypeAction('abc'))

    expect(state).toEqual({
      ...initialState,
      types: {
        'efg': { id: 'efg' },
      },
    })
  })
})

describe('contracts sagas', () => {

  const beginDeploymentAction = _test.actions.getBeginDeploymentAction(
    1, [1, 2, 3]
  )

  test('completes with valid args and state', () => {

    const state = cloneState()
    state.web3 = {
      ready: true,
      networkId: true,
      account: true,
    }

    return expectSaga(_test.sagas.deploySaga, beginDeploymentAction)
      .withState(state)
      .select(selectors.web3)
      .select(selectors.contracts)
      .provide([
        [matchers.call.fn(_test.fn.deployContract), true],
      ])
      .put.like({
        action: { type: ACTIONS.DEPLOYMENT_SUCCESS, data: true },
      })
      .run()
  })

  test('fails if web3 state not ready', () => {

    const state = cloneState()
    state.web3.ready = false

    return expectSaga(_test.sagas.deploySaga, beginDeploymentAction)
      .withState(state)
      .put(
        _test.actions.getDeploymentFailureAction(
          new Error('Reducer "web3" not ready.')
        )
      )
      .run()
  })
})
