
import web3, {
  sagas as web3Sagas,
  initialState as web3State,
} from './reducers/web3'

import contracts, {
  sagas as contractsSagas,
  initialState as contractsState,
} from './reducers/contracts'

export const initialState = {
  contracts: {...contractsState},
  web3: {...web3State},
}

export const reducers = {
  contracts, // these will be reducer keys in the target
  web3,
}

export const sagas = [
  ...web3Sagas,
  ...contractsSagas,
]
