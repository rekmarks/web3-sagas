
# web3-sagas
[Redux-Sagas](https://github.com/redux-saga/redux-saga) for Ethereum smart
contract deployment, and Soon<sup>TM</sup>, method calling and other goodies.

# Usage
`import` or `require` the module to expose an object with the following
properties, all of which you will need to incorporate in your root reducer
and root saga:
- `saga`
- `reducer`
- `initialState`
`web3-sagas` expects the user to have [MetaMask](https://metamask.io) installed.

# Installation
`npm install --save web3-sagas`

# Roadmap
- State persistence features (i.e. which keys to include and which keys to
exclude)
- Add deployed contract instances after importing their artifacts
- Call methods of deployed contract instances
- Chained contract deployments, e.g. a token and a crowdsale of said token

# License
MIT