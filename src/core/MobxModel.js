import { extendObservable, autorun, transaction, toJS, isObservableArray } from 'mobx';
import { mapValues, each, isRegExp, toObservableObj } from '../common/utils';
import globalMiddleware from './globalMiddleware';
let count = 0;
function actionWrap(fn) {
  return function _actionWrap() {
    let result;
    transaction(() => result = fn.apply(this, arguments));
    return result;
  };
}

export default class MobxModel {
  static uuid = 0
  constructor(initData = {}, middleware, autorunMap = {}, constants = {}) {
    if (
      this.constructor !== MobxModel &&
      this.constructor.uuid === Object.getPrototypeOf(this.constructor).uuid
    ) {
      throw new Error('[MobxModel] Can not immediately extend from MobxModel.');
    }
    this._actionStates = {};
    this._middleware = middleware || globalMiddleware;
    this._id = count ++;
    Object.keys(initData).forEach((key) => {
      if (constants[key] !== undefined) {
        throw new Error(`[MobxModel] data key "${key}" is defined in constants`);
      }
    });
    // check keys
    this._dataKeys = Object.keys(initData).concat(Object.keys(constants));
    this._checkDataKeys();
    // add constants
    const _constants = mapValues(constants, (value) => {
      return {
        enumerable: true,
        configurable: true,
        writable: false,
        value,
      };
    });
    // add observable keys
    Object.defineProperties(this, _constants);
    extendObservable(this, toObservableObj(initData));
    // exec init before autorun
    transaction(() => this.init(initData));
    // add auto run key
    each(autorunMap, (autorunFn) => {
      autorun(autorunFn, this);
    });
  }
  init(initData) {
    this.set({
      ...initData,
    });
  }
  getID() {
    return this._id;
  }
  get dataKeys() {
    return this._dataKeys;
  }
  set middleware(middleware) {
    this._middleware = middleware;
  }
  get middleware() {
    return this._middleware;
  }
  getActionState(actionName) {
    if (!this[actionName]) throw new Error('[MobxModel] Undefined action: ', actionName);
    if (!this._actionStates[actionName]) {
      extendObservable(this._actionStates, { [actionName]: { loading: false, error: null } });
    }
    return this._actionStates[actionName];
  }
  toJS(key) {
    function parse(val) {
      if (val instanceof MobxModel) {
        return val.toJS();
      }
      if (isObservableArray(val)) {
        return val.map(item => parse(item));
      } else if (isRegExp(val)) {
        return val;
      } else if (val && typeof val === 'object') {
        return mapValues(val, (item) => parse(item));
      }
      return toJS(val);
    }
    if (key) return parse(this[key]);
    return this._dataKeys.reduce((json, key) => {
      json[key] = parse(this[key]);
      return json;
    }, {});
  }
  toJSON(key) {
    return this.toJS(key);
  }
  stringify() {
    return JSON.stringify(this.toJS());
  }
  each(fn) {
    this._dataKeys.map((key) => {
      fn(this[key], key, this);
    });
  }
  toString() {
    return this.constructor.name;
  }
  _checkDataKeys() {
    this._dataKeys.forEach((dataKey) => {
      if (this[dataKey]) {
        throw new Error(`[MobxModel] Data key "${dataKey}" is defined in prototype methods.`);
      }
    });
  }
  set(key, val) {
    if (typeof key === 'string') {
      this[key] = val;
      return this;
    }
    transaction(() => mapValues(key, item => item, this));
    return this;
  }
  _setActionState(actionName, val) {
    this._actionStates[actionName] = val;
  }
}

export function toMobxActions(actions) {
  return mapValues(actions, (actionFn, actionName) => {
    return function (...actionArgs) {
      const actionContext = this;
      // Ensure actionState
      this.getActionState(actionName);
      // 1. add loading state and save the pre error
      this._setActionState(actionName, { loading: true, error: this._actionStates[actionName].error });
      // 2. exec action with hooks
      return this.middleware.execAction({ actionFn: actionWrap(actionFn), actionName, actionArgs, actionContext })
        .then((payload) => {
          // 3. loaded success
          this._setActionState(actionName, { loading: false, error: null });
          return payload;
        }).catch((error) => {
          // 4. loaded error
          this._setActionState(actionName, { loading: false, error });
          throw error;
        });
    };
  });
}

export function isMobxModelClass(target) {
  return target === MobxModel || target.prototype instanceof MobxModel;
}
