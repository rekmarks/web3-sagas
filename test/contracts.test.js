
/* eslint-env jest */

import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import uuidv4 from 'uuid/v4'

import { contracts as ACTIONS } from '../src/actions'
import selectors from '../src/selectors'
import contractsReducer, { initialState, _test } from '../src/reducers/contracts'
import { initialState as web3InitialState} from '../src/reducers/web3'

// TODO: finish testing all saga branches

describe('contracts reducer', () => {

  let state

  beforeEach(() => {
    state = { ...initialState }
  })

  test('Default', () => {
    state = contractsReducer(state, { type: 'KAPLAHHH', foo: 'bar' })
    expect(state).toEqual(initialState)
  })

  test(ACTIONS.CLEAR_ERRORS, () => {
    state.errors = [ new Error('blaha') ]
    state = contractsReducer(state, _test.actions.getClearErrorsAction())
    expect(state).toMatchObject({ errors: [] })
  })

  test(ACTIONS.BEGIN_DEPLOYMENT, () => {
    state.isDeploying = false
    state = contractsReducer(state, _test.actions.getBeginDeploymentAction())
    expect(state).toEqual({ ...initialState, isDeploying: true })
  })

  test(ACTIONS.DEPLOYMENT_FAILURE, () => {
    state = contractsReducer(state, _test.actions.getDeploymentFailureAction(
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
    state = contractsReducer(state, _test.actions.getDeploymentSuccessAction(
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
})

describe('contracts sagas', () => {

  const beginDeploymentAction = _test.actions.getBeginDeploymentAction(
    1, [1, 2, 3]
  )

  const cloneState = () => {
    return {
      contracts: { ...initialState },
      web3: { ...web3InitialState },
    }
  }

  test('completes with valid args and state', () => {

    const state = cloneState()
    state.web3 = {
      ready: true,
      provider: true,
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
