
// package imports

import { put, takeEvery, call, select } from 'redux-saga/effects'

import uuidv4 from 'uuid/v4'
import uuidv5 from 'uuid/v5'

import {
  contracts as defaultContracts, // all default contracts come from chain-end
  deploy as _deploy,
  // v2.0
  // getInstance,
  // callInstance,
} from 'chain-end'

// local imports

import { contracts as ACTIONS } from '../actions'

import selectors from '../selectors'

// contract type uuids are created using the contract bytecode (see call below)
// think of the resulting uuid as a hash of the contract artifact to help
// prevent the addition of duplicate contracts
import { NAMESPACE } from '../utils'

// import { getDisplayAddress } from '../utils' // eth address truncation

const initialState = {

  types: Object.values(defaultContracts).reduce((acc, c) => {
    const id = uuidv5(c.bytecode, NAMESPACE)
    acc[id] = {
      id: id,
      name: c.contractName,
      artifact: c, // Truffle compilation output
    }
    return acc
  }, {}),

  // error storage
  errors: [],

  // prevents further web3 calls if false
  ready: true,

  // deployed contract instances
  instances: {
    // id: {
    //   id,
    //   truffleContract,
    //   address,
    //   account,
    //   type,
    //   constructorParams,
    //   networkId,
    //   dappTemplateIds,
    //   templateNodeId,
    // }
  },

  // v2.0
  // // contract instance call storage
  // callHistory: [],

  // v3.0
  // // used when deploying dapps
  // deploymentQueue: null,
}

const sagas = {
  watchDeploySaga,
}

const _test = {
  actions: {
    getClearErrorsAction,
    getBeginDeploymentAction,
    getDeploymentFailureAction,
    getDeploymentSuccessAction,
    getEndDeploymentAction,
  },
  sagas: {
    deploySaga,
    watchDeploySaga,
  },
}

export {
  getBeginDeploymentAction as deployContract,
  getClearErrorsAction as clearErrors,
  initialState,
  sagas,
  _test,
}

export default function reducer (state = initialState, action) {

  switch (action.type) {

    case ACTIONS.BEGIN_DEPLOYMENT:
      return {
        ...state,
        ready: false,
      }

    case ACTIONS.END_DEPLOYMENT:
      return {
        ...state,
        ready: true,
      }

    case ACTIONS.DEPLOYMENT_SUCCESS:

      return {
        ...state,

        instances: {
          ...state.instances,

          [action.id]: {
            ...action.data,
            id: action.id,
            dappTemplateIds: action.data.dappTemplateIds || [],
          },
        },
      }

    case ACTIONS.DEPLOYMENT_FAILURE:
      return {
        ...state,
        errors: state.errors.concat(action.error),
        ready: true,
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
 * @param {string} contractId the uuid of the contract to deploy
 * @param {array} constructorParams the parameters, in the order they must be
 * passed to the constructor, or an object
 */
function getBeginDeploymentAction (contractId, constructorParams) {
  return {
    type: ACTIONS.BEGIN_DEPLOYMENT,
    contractId,
    constructorParams,
  }
}

function getEndDeploymentAction () {
  return {
    type: ACTIONS.END_DEPLOYMENT,
  }
}

function getDeploymentSuccessAction (id, data) {
  return {
    type: ACTIONS.DEPLOYMENT_SUCCESS,
    id: id,
    data: data,
  }
}

function getDeploymentFailureAction (error) {
  return {
    type: ACTIONS.DEPLOYMENT_FAILURE,
    error: error,
  }
}

function getClearErrorsAction () {
  return {
    type: ACTIONS.CLEAR_ERRORS,
  }
}

/**
 * Sagas
 */

function * watchDeploySaga () {
  yield takeEvery(ACTIONS.BEGIN_DEPLOYMENT, deploySaga)
}

/**
 * Attempts to deploy the given contract by calling its constructor with the
 * given parameters. Handles success and failure.
 *
 */
function * deploySaga (action) {

  // get necessary substate
  const web3 = yield select(selectors.web3)
  const contracts = yield select(selectors.contracts)

  let ready = false
  try { ready = prepareForDeployment(contracts, web3) } catch (error) {
    yield put(getDeploymentFailureAction(error))
  }

  if (ready) {
    try {
      const result = yield call(
        deployContract,
        web3,
        contracts.types,
        action.contractId,
        action.constructorParams
      )
      yield put(getDeploymentSuccessAction(uuidv4(), result))
    } catch (error) {
      yield put(getDeploymentFailureAction(error))
    }
  }
  yield put(getEndDeploymentAction())
}

/**
 * Internal helpers
 */

/**
 * Validates pre-deployment state. Throws error if validation fails.
 * Returns true otherwise.
 *
 * @param {object} contracts contracts substate
 * @param {object} web3 redux web3 substate
 * @return {bool} true if validation successful, else throws
 */
function prepareForDeployment (contracts, web3) {

  if (!contracts.ready) {
    throw new Error('contracts not ready')
  }
  if (!web3.ready) {
    throw new Error('web3 not ready')
  }
  if (!web3.provider) {
    throw new Error('missing web3 provider')
  }
  if (!web3.account) {
    throw new Error('missing web3 account')
  }
  return true
}

/**
 * Helper performing actual deployment work.
 * Validates that the contract's artifact exists and that the web3 call is
 * successful.
 *
 * @param {object} web3 redux web3 substate
 * @param {object} contractTypes contract types from state
 * @param {string} contractId name of contract to deploy
 * @param {array} constructorParams constructor parameters
 * @return {object} deployment data if successful, throws otherwise
 */
async function deployContract (
    web3,
    contractTypes,
    contractId,
    constructorParams,
  ) {

  // validation
  if (!contractTypes[contractId]) {
    throw new Error('No contract with id "' + contractId + '" found.')
  }

  let arrayParams = []
  if (!Array.isArray(constructorParams)) {
    // convert object of params with data to array of param values
    arrayParams = Object.keys(constructorParams)
      .sort((a, b) => {
        return constructorParams[a].paramOrder -
               constructorParams[b].paramOrder
      })
      .map(key => constructorParams[key].value)
  } else {
    arrayParams = constructorParams
  }

  const artifact = contractTypes[contractId].artifact

  // actual web3 call happens in here
  // this may throw and that's fine
  const instance = await _deploy(
    artifact,
    arrayParams,
    web3.provider,
    web3.account
  )

  if (!instance) throw new Error('Deployment returned no instance.')

  // success, return deployment data
  return {
    instance: instance,
    address: instance.address,
    account: web3.account,
    type: artifact.contractName,
    constructorParams: constructorParams,
    networkId: web3.networkId,
  }
}
