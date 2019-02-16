"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deployContract = getBeginDeploymentAction;
exports.clearErrors = getClearErrorsAction;
exports.default = reducer;
exports._test = exports.sagas = exports.initialState = void 0;

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectSpread3 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _effects = require("redux-saga/effects");

var _v = _interopRequireDefault(require("uuid/v4"));

var _v2 = _interopRequireDefault(require("uuid/v5"));

var _chainEnd = require("chain-end");

var _actions = require("../actions");

var _selectors = _interopRequireDefault(require("../selectors"));

var _utils = require("../utils");

var _marked =
/*#__PURE__*/
_regenerator.default.mark(watchDeploySaga),
    _marked2 =
/*#__PURE__*/
_regenerator.default.mark(deploySaga);

// import { getDisplayAddress } from '../utils' // eth address truncation
var initialState = {
  types: Object.values(_chainEnd.contracts).reduce(function (acc, c) {
    var id = (0, _v2.default)(c.bytecode, _utils.NAMESPACE);
    acc[id] = {
      id: id,
      name: c.contractName,
      artifact: c // Truffle compilation output

    };
    return acc;
  }, {}),
  // error storage
  errors: [],
  // prevents further web3 calls if false
  isDeploying: false,
  // deployed contract instances
  instances: {// id: {
    //   id,
    //   truffleContract,
    //   address,
    //   account,
    //   type,
    //   constructorParams,
    //   networkId,
    //   dappTemplateIds,
    //   templateNodeId,
    // }
  } // v2.0
  // // contract instance call storage
  // callHistory: [],
  // v3.0
  // // used when deploying dapps
  // deploymentQueue: null,

};
exports.initialState = initialState;
var sagas = [(0, _effects.takeLeading)(_actions.contracts.BEGIN_DEPLOYMENT, deploySaga)];
exports.sagas = sagas;
var _test = {
  actions: {
    getClearErrorsAction: getClearErrorsAction,
    getBeginDeploymentAction: getBeginDeploymentAction,
    getDeploymentFailureAction: getDeploymentFailureAction,
    getDeploymentSuccessAction: getDeploymentSuccessAction
  },
  sagas: {
    deploySaga: deploySaga,
    watchDeploySaga: watchDeploySaga
  },
  fn: {
    deployContract: deployContract,
    prepareForDeployment: prepareForDeployment
  }
};
exports._test = _test;

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case _actions.contracts.BEGIN_DEPLOYMENT:
      return (0, _objectSpread3.default)({}, state, {
        isDeploying: true
      });

    case _actions.contracts.END_DEPLOYMENT:
      return (0, _objectSpread3.default)({}, state, {
        isDeploying: false
      });

    case _actions.contracts.DEPLOYMENT_SUCCESS:
      return (0, _objectSpread3.default)({}, state, {
        instances: (0, _objectSpread3.default)({}, state.instances, (0, _defineProperty2.default)({}, action.id, (0, _objectSpread3.default)({}, action.data, {
          id: action.id // dappTemplateIds: action.data.dappTemplateIds || [],

        }))),
        isDeploying: false
      });

    case _actions.contracts.DEPLOYMENT_FAILURE:
      return (0, _objectSpread3.default)({}, state, {
        errors: state.errors.concat(action.error),
        isDeploying: false
      });

    case _actions.contracts.CLEAR_ERRORS:
      return (0, _objectSpread3.default)({}, state, {
        errors: []
      });

    default:
      return state;
  }
}
/**
 * Synchronous action creators
 */

/**
 * Initializes contract deployment.
 * @param {string} contractId the uuid of the contract to deploy
 * @param {array} constructorParams the parameters, in the order they must be
 * passed to the constructor, or an object
 */


function getBeginDeploymentAction(contractId, constructorParams) {
  return {
    type: _actions.contracts.BEGIN_DEPLOYMENT,
    contractId: contractId,
    constructorParams: constructorParams
  };
}

function getDeploymentSuccessAction(id, data) {
  return {
    type: _actions.contracts.DEPLOYMENT_SUCCESS,
    id: id,
    data: data
  };
}

function getDeploymentFailureAction(error) {
  return {
    type: _actions.contracts.DEPLOYMENT_FAILURE,
    error: error
  };
}

function getClearErrorsAction() {
  return {
    type: _actions.contracts.CLEAR_ERRORS
  };
}
/**
 * Sagas
 */

/**
 * Watcher for deploySaga.
 */


function watchDeploySaga() {
  return _regenerator.default.wrap(function watchDeploySaga$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _effects.takeLeading)(_actions.contracts.BEGIN_DEPLOYMENT, deploySaga);

        case 2:
        case "end":
          return _context.stop();
      }
    }
  }, _marked, this);
}
/**
 * Attempts to deploy the given contract by calling its constructor with the
 * given parameters. Handles success and failure.
 * @param {object} action the action initializing the deployment procedure
 */


function deploySaga(action) {
  var web3, contracts, ready, result;
  return _regenerator.default.wrap(function deploySaga$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _effects.select)(_selectors.default.web3);

        case 2:
          web3 = _context2.sent;
          _context2.next = 5;
          return (0, _effects.select)(_selectors.default.contracts);

        case 5:
          contracts = _context2.sent;
          ready = false;
          _context2.prev = 7;
          ready = prepareForDeployment(web3);
          _context2.next = 15;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](7);
          _context2.next = 15;
          return (0, _effects.put)(getDeploymentFailureAction(_context2.t0));

        case 15:
          if (!ready) {
            _context2.next = 28;
            break;
          }

          _context2.prev = 16;
          _context2.next = 19;
          return (0, _effects.call)(deployContract, web3, contracts.types, action.contractId, action.constructorParams);

        case 19:
          result = _context2.sent;
          _context2.next = 22;
          return (0, _effects.put)(getDeploymentSuccessAction((0, _v.default)(), result));

        case 22:
          _context2.next = 28;
          break;

        case 24:
          _context2.prev = 24;
          _context2.t1 = _context2["catch"](16);
          _context2.next = 28;
          return (0, _effects.put)(getDeploymentFailureAction(_context2.t1));

        case 28:
        case "end":
          return _context2.stop();
      }
    }
  }, _marked2, this, [[7, 11], [16, 24]]);
}
/**
 * Internal helpers
 */

/**
 * Validates pre-deployment state. Throws error if validation fails.
 * Returns true otherwise.
 *
 * @param {object} web3 redux web3 substate
 * @return {bool} true if validation successful, else throws
 */


function prepareForDeployment(web3) {
  if (!web3.ready) {
    throw new Error('Reducer "web3" not ready.');
  }

  if (!web3.provider) {
    throw new Error('Missing web3 provider.');
  }

  if (!web3.account) {
    throw new Error('Missing web3 account.');
  }

  return true;
}
/**
 * Helper performing actual deployment work.
 * Validates that the contract's artifact exists and that the web3 call is
 * successful.
 *
 * @param {object} web3 redux web3 substate
 * @param {object} contractTypes contract types from state
 * @param {string} contractId name of contract to deploy
 * @param {array} constructorParams constructor parameters
 * @return {object} deployment data if successful, throws otherwise
 */


function deployContract(_x, _x2, _x3, _x4) {
  return _deployContract.apply(this, arguments);
}

function _deployContract() {
  _deployContract = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(web3, contractTypes, contractId, constructorParams) {
    var arrayParams, artifact, instance;
    return _regenerator.default.wrap(function _callee$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (contractTypes[contractId]) {
              _context3.next = 2;
              break;
            }

            throw new Error('No contract with id "' + contractId + '" found.');

          case 2:
            // TODO: actually expect only arrays for this argument
            // and move this conversion higher up the call chain
            // (do form an object as below in the React component)
            arrayParams = [];

            if (!Array.isArray(constructorParams)) {
              // convert object of params with data to array of param values
              arrayParams = Object.keys(constructorParams).sort(function (a, b) {
                return constructorParams[a].paramOrder - constructorParams[b].paramOrder;
              }).map(function (key) {
                return constructorParams[key].value;
              });
            } else {
              arrayParams = constructorParams;
            }

            artifact = contractTypes[contractId].artifact; // actual web3 call happens in here
            // this may throw and that's fine

            _context3.next = 7;
            return (0, _chainEnd.deploy)(artifact, arrayParams, web3.provider, web3.account);

          case 7:
            instance = _context3.sent;
            return _context3.abrupt("return", {
              instance: instance,
              address: instance.address,
              account: web3.account,
              type: artifact.contractName,
              constructorParams: constructorParams,
              networkId: web3.networkId
            });

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee, this);
  }));
  return _deployContract.apply(this, arguments);
}
//# sourceMappingURL=contracts.js.map