
import {
  initialState as contractsState,
  reducer as contracts,
  sagas as contractsSagas,
  deployContract,
  clearErrors as clearContractsErrors,
  addContractType,
  removeContractType,
} from './reducers/contracts'

import {
  initialState as web3State,
  reducer as web3,
  sagas as web3Sagas,
  getWeb3,
  clearErrors as clearWeb3Errors,
} from './reducers/web3'

import { contracts as contractsActions, web3 as web3Actions } from './actions'

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

export const actionCreators = {
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

export const actionNames = {
  contracts: contractsActions,
  web3: web3Actions,
}

export { NAMESPACE } from './utils'
export { addInitialContractType } from './reducers/contracts'
export { addListeners } from './reducers/web3'
export { selectors } from './selectors'
