
import '@babel/polyfill'

import web3Reducer, {
  sagas as web3Sagas,
  initialState as web3State,
} from './reducers/web3'

import contractsReducer, {
  sagas as contractsSagas,
  initialState as contractsState,
} from './reducers/contracts'

const initialState = {
  contracts: {...contractsState},
  web3: {...web3State},
}

const reducers = {
  contractsReducer,
  web3Reducer,
}

const sagas = [
  ...web3Sagas,
  ...contractsSagas,
]

export {
  sagas,
  reducers,
  initialState,
}
