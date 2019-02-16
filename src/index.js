
// import '@babel/polyfill'

import web3Reducer, {
  sagas as web3Sagas,
  initialState as web3State,
} from './reducers/web3'

import contractsReducer, {
  sagas as contractsSagas,
  initialState as contractsState,
} from './reducers/contracts'

export const initialState = {
  contracts: {...contractsState},
  web3: {...web3State},
}

export const reducers = {
  contractsReducer,
  web3Reducer,
}

export const sagas = [
  ...web3Sagas,
  ...contractsSagas,
]
