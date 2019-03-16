
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
store.addListeners(store.dispatch) // monitor window.ethereum and dispatch actions

ReactDOM.render(
  <Provider store={store}>
    // ...
```
### Actions

Import the following properties to dispatch actions or define your own Sagas:
- `actionCreators`
- `actionNames`

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