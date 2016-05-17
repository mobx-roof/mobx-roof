import { extendObservable, toJSON, autorun } from 'mobx';
import { mapValues, each } from '../common/utils';
import MobxMiddleware from './MobxMiddleware';
let count = 0;

export default class MobxModel {
  static uuid = 0
  static _name = 'MobxModel'
  constructor(initData = {}, middleware, autorunMap = {}) {
    if (
      this.constructor !== MobxModel &&
      this.constructor.uuid === Object.getPrototypeOf(this.constructor).uuid
    ) {
      throw new Error('Can not immediately extend from MobxModel.');
    }
    this._actionStates = {};
    this._middleware = middleware || new MobxMiddleware;
    this._id = count ++;
    this._dataKeys = Object.keys(initData);
    this._checkDataKeys();
    extendObservable(this, { ...initData });
    each(autorunMap, (autorunFn) => {
      autorun(autorunFn, this);
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
  getActionState(actionName) {
    if (!this[actionName]) throw new Error('Undefined action: ', actionName);
    if (!this._actionStates[actionName]) {
      extendObservable(this._actionStates, { [actionName]: { loading: false, error: null } });
    }
    return this._actionStates[actionName];
  }
  toJSON(key) {
    if (key) return toJSON(this[key]);
    return this._dataKeys.reduce((json, key) => {
      json[key] = toJSON(this[key]);
      return json;
    }, {});
  }
  stringify() {
    return JSON.stringify(this.toJSON());
  }
  each(fn) {
    this._dataKeys.map((key) => {
      fn(this[key], key, this);
    });
  }
  toString() {
    return this.constructor._name;
  }
  _checkDataKeys() {
    this._dataKeys.forEach((dataKey) => {
      if (this[dataKey]) {
        throw new Error(`Data key "${dataKey}" is defined in action.`);
      }
    });
  }
}

export function toMobxActions(actions) {
  return mapValues(actions, (actionFn, actionName) => {
    return function (...actionArgs) {
      const actionContext = this;
      // Ensure actionState
      this.getActionState(actionName);
      // 1. add loading state and save the pre error
      this._actionStates[actionName] = { loading: true, error: this._actionStates[actionName].error };
      // 2. exec action with hooks
      return this._middleware.execAction({ actionFn, actionName, actionArgs, actionContext })
        .then((payload) => {
          // 3. loaded success
          this._actionStates[actionName] = { loading: false, error: null };
          return payload;
        }).catch((error) => {
          // 4. loaded error
          this._actionStates[actionName] = { loading: false, error };
          throw error;
        });
    };
  });
}

export function isMobxModelClass(target) {
  return target === MobxModel || target.prototype instanceof MobxModel;
}
