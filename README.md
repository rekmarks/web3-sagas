# This Repository has Been Archived

# web3-sagas
[Redux-Sagas](https://github.com/redux-saga/redux-saga) for Ethereum smart
contract deployment, and Soon<sup>TM</sup>, method calling and other goodies.

## Installation
`npm install web3-sagas`

## Usage

`web3-sagas` expects the end user to have [MetaMask](https://metamask.io) installed.

For example usecase, see [TokenMinter](https://github.com/rekmarks/tokenminter).
For similar patterns but using `redux-thunk` internally, see [DappGrapher](https://github.com/rekmarks/dapp-grapher).

### `rootReducer.js`
```js

import { combineReducers } from 'redux'
import {
  reducers as w3sReducers,
  initialState as w3sInitialState,
} from 'web3-sagas'

import { fooReducer, fooInitialState } from './reducers/foo'
// ...

export const reducer = combineReducers({
  ...w3sReducers,
  foo: fooReducer,
  // ...
})

export const initialState = {
  ...w3sInitialState,
  foo: fooInitialState,
  // ...
}
```

### `rootSaga.js`
```js
import { sagas as web3Sagas } from 'web3-sagas'

import { fooSagas } from './sagas/foo'
// ...

export default function * rootSaga () {
  yield all([
    ...web3Sagas,
    ...fooSagas,
    // ...
  ])
}
```

### `configureStore.js`
```js
import { compose, createStore, applyMiddleware } from 'redux'
import createSagaMiddleWare from 'redux-saga'
import { all } from 'redux-saga/effects'
import { addInitialContractType, addListeners } from 'web3-sagas'

import { reducer, initialState } from './rootReducer'
import rootSaga from './rootSaga'
import myContractArtifacts from '.../contracts'

const sagaMiddleware = createSagaMiddleWare()

// set up enhancer
const enhancer = compose(
  applyMiddleware(
    sagaMiddleware,
    // ...and your other middlewares
  ),
)

// add initial contracts to state
// - only use this function at store configuration
// - actions are exposed to add contract types at runtime
Object.values(myContractArtifacts).forEach(c => {
  addInitialContractType(initialState.contracts, c)
})

export default function configureStore () {
  return {
    ...createStore(reducer, initialState, enhancer),
    runSaga: () => sagaMiddleware.run(rootSaga),
    addListeners: dispatch => addListeners(dispatch),
  }
}
```

### `index.js`
```js

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
// your other package imports...

import configureStore from '/redux/configureStore'

const store = configureStore()
store.runSaga() // run the root saga

// after you've confirmed that window.ethereum is injected,
// call this in your main App component to monitor window.ethereum
// and dispatch actions in response to network and account changes
const addWeb3Listeners = () => store.addListeners(store.dispatch)

ReactDOM.render(
  <Provider store={store}>
    <App addWeb3Listeners={addWeb3Listeners} />
    // ...
```
## Actions

Import the following properties to dispatch actions or define your own Sagas:
- `actionCreators`
- `actionNames`

Important actions and their usage are described below.

### web3
#### `getWeb3()`
Initializes the web3 reducer state, which must be done before any further web3
calls can be made.

#### `watchAsset(address, symbol, decimals)`
Attempts to add a token to the user's wallet.

### contracts
#### `deploy(contractId, constructorParams)`
Attempts to deploy the contract with the given `contractId`. `constructorParams`
must be an array with the parameters in the order defined in the declaration
of the contract's constructor in Solidity. If you compile using Truffle (and
presumably through other methods), this order is preserved in the ABI.

### Miscellaneous

You can import `NAMESPACE` to access the namespace used internally along with contract
bytecode to generate `uuid/v5` ids.

## Roadmap
- State persistence features (i.e. which keys to include and which keys to
exclude)
- Add deployed contract instances after importing their artifacts
- Call methods of deployed contract instances
- Chained contract deployments, e.g. a token and a crowdsale of said token

## License
MIT
