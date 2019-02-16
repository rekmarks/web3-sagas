"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.getWeb3=getWeb3Action,exports.clearErrors=getClearErrorsAction,exports.default=reducer,exports._test=exports.sagas=exports.initialState=void 0;var _regenerator=_interopRequireDefault(require("@babel/runtime/regenerator")),_objectSpread2=_interopRequireDefault(require("@babel/runtime/helpers/objectSpread")),_effects=require("redux-saga/effects"),_actions=require("../actions"),_marked=/*#__PURE__*/_regenerator.default.mark(watchGetWeb3),_marked2=/*#__PURE__*/_regenerator.default.mark(getWeb3Saga),initialState={account:null,// current selected account from injected web3 object
networkId:null,// current selected network id from injected web3 object
provider:null,// current provider from injected web3 object
ready:!1,// false on start or if any thunks have yet to return, true o.w.
errors:[]// storage for web3 errors
};exports.initialState=initialState;var sagas=[(0,_effects.takeLatest)(_actions.web3.GET_WEB3,getWeb3Saga)];exports.sagas=sagas;var _test={actions:{getWeb3Action:getWeb3Action,getWeb3FailureAction:getWeb3FailureAction,getWeb3SuccessAction:getWeb3SuccessAction,getClearErrorsAction:getClearErrorsAction},sagas:{getWeb3Saga:getWeb3Saga,watchGetWeb3:watchGetWeb3}};exports._test=_test;function reducer(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:initialState,b=1<arguments.length?arguments[1]:void 0;switch(b.type){case _actions.web3.GET_WEB3:return(0,_objectSpread2.default)({},initialState);case _actions.web3.GET_WEB3_SUCCESS:return(0,_objectSpread2.default)({},a,{ready:!0,provider:b.provider,account:b.account,networkId:b.networkId});case _actions.web3.GET_WEB3_FAILURE:return(0,_objectSpread2.default)({},a,{errors:a.errors.concat(b.error)});case _actions.web3.CLEAR_ERRORS:return(0,_objectSpread2.default)({},a,{errors:[]});default:return a;}}/**
 * Synchronous action creators
 */ /**
 * Gets web3, adds it to state.
 */function getWeb3Action(){return{type:_actions.web3.GET_WEB3}}/**
 * On getWeb3 success, adds provider, account, and networkId to state.
 * @param {object} provider
 * @param {string} account
 * @param {string} networkId
 */function getWeb3SuccessAction(a,b,c){return{type:_actions.web3.GET_WEB3_SUCCESS,provider:a,account:b,networkId:c}}/**
 * On getWeb3 failure, adds error to state.
 * @param {error} error
 */function getWeb3FailureAction(a){return{type:_actions.web3.GET_WEB3_FAILURE,error:a}}/**
 * Clears errors from state.
 */function getClearErrorsAction(){return{type:_actions.web3.CLEAR_ERRORS}}/**
 * Sagas
 */ /**
 * Watcher for getWeb3Saga.
 */function watchGetWeb3(){return _regenerator.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,(0,_effects.takeLatest)(_actions.web3.GET_WEB3,getWeb3Saga);case 2:case"end":return a.stop();}},_marked,this)}/**
 * Saga. Gets the injected web3 object. Assumes window.ethereum.enable()
 * already called. Does not support legacy dapp browsers.
 *
 * TODO: Add support for other EIP1102-compliant dapp browsers.
 */function getWeb3Saga(){var a,b,c;return _regenerator.default.wrap(function(d){for(;;)switch(d.prev=d.next){case 0:if(!(window.ethereum&&window.ethereum.isMetaMask)){d.next=13;break}d.prev=1,a=window.ethereum,b=window.ethereum.selectedAddress,c=window.ethereum.networkVersion,d.next=11;break;case 7:return d.prev=7,d.t0=d["catch"](1),d.next=11,(0,_effects.put)(getWeb3FailureAction(d.t0));case 11:d.next=16;break;case 13:return console.warn("Please install MetaMask."),d.next=16,(0,_effects.put)(getWeb3FailureAction(new Error("window.ethereum not found.")));case 16:if(b&&!(1>b.length)&&c){d.next=21;break}return d.next=19,(0,_effects.put)(getWeb3FailureAction(new Error("Missing or invalid account or network id.",b)));case 19:d.next=23;break;case 21:return d.next=23,(0,_effects.put)(getWeb3SuccessAction(a,b,c));case 23:case"end":return d.stop();}},_marked2,this,[[1,7]])}
//# sourceMappingURL=web3.js.map