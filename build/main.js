"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialState = exports.reducers = exports.sagas = void 0;

require("@babel/polyfill");

var _web = _interopRequireWildcard(require("./reducers/web3"));

var _contracts = _interopRequireWildcard(require("./reducers/contracts"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const initialState = {
  contracts: { ..._contracts.initialState
  },
  web3: { ..._web.initialState
  }
};
exports.initialState = initialState;
const reducers = {
  contractsReducer: _contracts.default,
  web3Reducer: _web.default
};
exports.reducers = reducers;
const sagas = [..._web.sagas, ..._contracts.sagas];
exports.sagas = sagas;