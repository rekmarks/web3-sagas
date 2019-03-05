
import {
  initialState as contractsState,
  reducer as contracts,
  sagas as contractsSagas,
} from './reducers/contracts'

import {
  initialState as web3State,
  reducer as web3,
  sagas as web3Sagas,
} from './reducers/web3'

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

export { NAMESPACE, getDisplayAddress } from './utils'
export { addInitialContractType } from './reducers/contracts'
