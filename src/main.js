
import {
  initialState as contractsState,
  reducer as contracts,
  sagas as contractsSagas,
  deployContract,
  clearErrors as clearContractsErrors,
  addContractType,
  removeContractType,
  addInitialContractType,
} from './reducers/contracts'

import {
  initialState as web3State,
  reducer as web3,
  sagas as web3Sagas,
  getWeb3,
  clearErrors as clearWeb3Errors,
} from './reducers/web3'

import { NAMESPACE, getDisplayAddress } from './utils'


export const initialState = {
  contracts: { ...contractsState },
  web3: { ...web3State },
}

export const reducers = {
  contracts, // these will be reducer keys in the target
  web3,
}

export const sagas = [
  ...web3Sagas,
  ...contractsSagas,
]

export const actions = {
  contracts: {
    deploy: deployContract,
    clearErrors: clearContractsErrors,
    addContractType: addContractType,
    removeContractType: removeContractType,
  },
  web3: {
    getWeb3: getWeb3,
    clearErrors: clearWeb3Errors,
  },
}

export const utils = {
  NAMESPACE,
  getDisplayAddress,
  addInitialContractType,
}
