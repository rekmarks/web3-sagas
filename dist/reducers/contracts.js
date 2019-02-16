"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.deployContract=getBeginDeploymentAction,exports.clearErrors=getClearErrorsAction,exports.reducer=reducer,exports._test=exports.sagas=exports.initialState=void 0;var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator")),_regenerator=_interopRequireDefault(require("@babel/runtime/regenerator")),_defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty")),_objectSpread3=_interopRequireDefault(require("@babel/runtime/helpers/objectSpread")),_effects=require("redux-saga/effects"),_v=_interopRequireDefault(require("uuid/v4")),_v2=_interopRequireDefault(require("uuid/v5")),_chainEnd=require("chain-end"),_actions=require("../actions"),_selectors=_interopRequireDefault(require("../selectors")),_utils=require("../utils"),_marked=/*#__PURE__*/_regenerator.default.mark(watchDeploySaga),_marked2=/*#__PURE__*/_regenerator.default.mark(deploySaga),initialState={types:Object.values(_chainEnd.contracts).reduce(function(a,b){var c=(0,_v2.default)(b.bytecode,_utils.NAMESPACE);return a[c]={id:c,name:b.contractName,artifact:b// Truffle compilation output
},a},{}),// error storage
errors:[],// prevents further web3 calls if false
isDeploying:!1,// deployed contract instances
instances:{// id: {
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
}// v2.0
// // contract instance call storage
// callHistory: [],
// v3.0
// // used when deploying dapps
// deploymentQueue: null,
};exports.initialState=initialState;var sagas=[(0,_effects.takeLeading)(_actions.contracts.BEGIN_DEPLOYMENT,deploySaga)];exports.sagas=sagas;var _test={actions:{getClearErrorsAction:getClearErrorsAction,getBeginDeploymentAction:getBeginDeploymentAction,getDeploymentFailureAction:getDeploymentFailureAction,getDeploymentSuccessAction:getDeploymentSuccessAction},sagas:{deploySaga:deploySaga,watchDeploySaga:watchDeploySaga},fn:{deployContract:deployContract,prepareForDeployment:prepareForDeployment}};exports._test=_test;function reducer(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:initialState,b=1<arguments.length?arguments[1]:void 0;switch(b.type){case _actions.contracts.BEGIN_DEPLOYMENT:return(0,_objectSpread3.default)({},a,{isDeploying:!0});case _actions.contracts.END_DEPLOYMENT:return(0,_objectSpread3.default)({},a,{isDeploying:!1});case _actions.contracts.DEPLOYMENT_SUCCESS:return(0,_objectSpread3.default)({},a,{instances:(0,_objectSpread3.default)({},a.instances,(0,_defineProperty2.default)({},b.id,(0,_objectSpread3.default)({},b.data,{id:b.id// dappTemplateIds: action.data.dappTemplateIds || [],
}))),isDeploying:!1});case _actions.contracts.DEPLOYMENT_FAILURE:return(0,_objectSpread3.default)({},a,{errors:a.errors.concat(b.error),isDeploying:!1});case _actions.contracts.CLEAR_ERRORS:return(0,_objectSpread3.default)({},a,{errors:[]});default:return a;}}/**
 * Synchronous action creators
 */ /**
 * Initializes contract deployment.
 * @param {string} contractId the uuid of the contract to deploy
 * @param {array} constructorParams the parameters, in the order they must be
 * passed to the constructor, or an object
 */function getBeginDeploymentAction(a,b){return{type:_actions.contracts.BEGIN_DEPLOYMENT,contractId:a,constructorParams:b}}function getDeploymentSuccessAction(a,b){return{type:_actions.contracts.DEPLOYMENT_SUCCESS,id:a,data:b}}function getDeploymentFailureAction(a){return{type:_actions.contracts.DEPLOYMENT_FAILURE,error:a}}function getClearErrorsAction(){return{type:_actions.contracts.CLEAR_ERRORS}}/**
 * Sagas
 */ /**
 * Watcher for deploySaga.
 */function watchDeploySaga(){return _regenerator.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,(0,_effects.takeLeading)(_actions.contracts.BEGIN_DEPLOYMENT,deploySaga);case 2:case"end":return a.stop();}},_marked,this)}/**
 * Attempts to deploy the given contract by calling its constructor with the
 * given parameters. Handles success and failure.
 * @param {object} action the action initializing the deployment procedure
 */function deploySaga(a){var b,c,d,e;return _regenerator.default.wrap(function(f){for(;;)switch(f.prev=f.next){case 0:return f.next=2,(0,_effects.select)(_selectors.default.web3);case 2:return b=f.sent,f.next=5,(0,_effects.select)(_selectors.default.contracts);case 5:c=f.sent,d=!1,f.prev=7,d=prepareForDeployment(b),f.next=15;break;case 11:return f.prev=11,f.t0=f["catch"](7),f.next=15,(0,_effects.put)(getDeploymentFailureAction(f.t0));case 15:if(!d){f.next=28;break}return f.prev=16,f.next=19,(0,_effects.call)(deployContract,b,c.types,a.contractId,a.constructorParams);case 19:return e=f.sent,f.next=22,(0,_effects.put)(getDeploymentSuccessAction((0,_v.default)(),e));case 22:f.next=28;break;case 24:return f.prev=24,f.t1=f["catch"](16),f.next=28,(0,_effects.put)(getDeploymentFailureAction(f.t1));case 28:case"end":return f.stop();}},_marked2,this,[[7,11],[16,24]])}/**
 * Internal helpers
 */ /**
 * Validates pre-deployment state. Throws error if validation fails.
 * Returns true otherwise.
 *
 * @param {object} web3 redux web3 substate
 * @return {bool} true if validation successful, else throws
 */function prepareForDeployment(a){if(!a.ready)throw new Error("Reducer \"web3\" not ready.");if(!a.provider)throw new Error("Missing web3 provider.");if(!a.account)throw new Error("Missing web3 account.");return!0}/**
 * Helper performing actual deployment work.
 * Validates that the contract's artifact exists and that the web3 call is
 * successful.
 *
 * @param {object} web3 redux web3 substate
 * @param {object} contractTypes contract types from state
 * @param {string} contractId name of contract to deploy
 * @param {array} constructorParams constructor parameters
 * @return {object} deployment data if successful, throws otherwise
 */function deployContract(){return _deployContract.apply(this,arguments)}function _deployContract(){return _deployContract=(0,_asyncToGenerator2.default)(/*#__PURE__*/_regenerator.default.mark(function a(b,c,d,e){var f,g,h;return _regenerator.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(c[d]){a.next=2;break}throw new Error("No contract with id \""+d+"\" found.");case 2:return f=[],f=Array.isArray(e)?e:Object.keys(e).sort(function(c,a){return e[c].paramOrder-e[a].paramOrder}).map(function(a){return e[a].value}),g=c[d].artifact,a.next=7,(0,_chainEnd.deploy)(g,f,b.provider,b.account);case 7:return h=a.sent,a.abrupt("return",{instance:h,address:h.address,account:b.account,type:g.contractName,constructorParams:e,networkId:b.networkId});case 9:case"end":return a.stop();}},a,this)})),_deployContract.apply(this,arguments)}
//# sourceMappingURL=contracts.js.map