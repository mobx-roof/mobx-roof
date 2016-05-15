const toString = Object.prototype.toString;
import { isObservable, observable } from 'mobx';
import { CONTEXT_NAME } from './constants';
import { PropTypes } from 'react';
/**
 * @param {Object} target
 * @param {Array<String>} methods
 */
export function autobind(target, methods) {
  methods.forEach(methodName => {
    if (!target[methodName]) {
      throw new Error(`Undefined method "${methodName}"`);
    }
    target[methodName] = target[methodName].bind(this);
  });
}
/**
 * Applies a function to every key-value pair inside an object.
 *
 * @param {Object} obj - The source object.
 * @param {Function} fn - The mapper function that receives the value and the key.
 * @param {Object?} res - Result object
 * @returns {Object} A new object that contains the mapped values for the keys.
 */
export function mapValues(obj, fn, res = {}) {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key], key);
    return result;
  }, res);
}
/**
 * @param {*} val
 * @returns {Promise}
 */
export function toPromise(val) {
  if (val && typeof val.then === 'function') {
    return val;
  }
  return Promise.resolve(val);
}
export function toObservableObj(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Utils.toObservableObj need an object parameter.');
  if (isObservable(obj)) return obj;
  if (Array.isArray(obj)) {
    return observable(obj.map(val => typeof val === 'object' ? toObservableObj(val) : val));
  }
  return observable(mapValues(obj, (val) => {
    if (typeof val === 'function') {
      throw new Error('Model initData must be a plainObject');
    }
    return typeof val === 'object' ? toObservableObj(val) : val;
  }));
}
/**
 * @param {React.Component} WrappedComponent
 */
export function addMobxContextToComponent(WrappedComponent) {
  WrappedComponent.contextTypes = {
    [CONTEXT_NAME]: PropTypes.object.isRequired,
    ...WrappedComponent.contextTypes,
  };
}
export function each(obj = {}, fn) {
  Object.keys(obj).forEach((key) => {
    fn(obj[key], key);
  });
}

export const isFunction = arg => toString.call(arg) === '[object Function]';
export const isRegExp = arg => toString.call(arg) === '[object RegExp]';

export function compose(arr, arg) {
  return arr.reduce((cur, fn) => {
    return cur.then(res => fn(res));
  }, Promise.resolve(arg));
}
