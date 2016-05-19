import { isFunction } from './utils';
import Control, { CANCLE_KEY, END_KEY } from './Control';

export default class Middleware {
  middleware = [];

  constructor(middleware) {
    this.use(middleware);
  }

  /**
   * Add middleware
   * @param  {Function|Array<Function>} middleware
   */
  use(middleware = []) {
    if (!Array.isArray(middleware)) {
      middleware = [middleware];
    }
    for (const fn of middleware) {
      if (!isFunction(fn)) {
        throw new TypeError('Middleware must be composed of functions!');
      }
    }
    this.middleware = [...this.middleware, ...middleware];
  }
  remove(middleware = []) {
    if (!Array.isArray(middleware)) {
      middleware = [middleware];
    }
    middleware.forEach((item) => {
      const index = this.middleware.indexOf(item);
      this.middleware.splice(index, 1);
    });
  }
  isEmpty() {
    return this.middleware.length === 0;
  }
  /**
   * Compose all middleware
   * @param {object} arg
   * @param {function} controlFn
   * @return {Promise}
   */
  compose(arg = {}, controlFn) {
    return this.middleware.reduce((pm, fn) => {
      return pm.then((payload) => {
        if (controlFn) {
          const error = new Error('ControlError');
          error.control = controlFn({ ...arg, payload });
          error.payload = payload;
          if (error.control instanceof Control) throw error;
        }
        return fn({ ...arg, payload });
      });
    }, Promise.resolve(arg.payload)).catch((e) => {
      if (e.control && e.control instanceof Control) {
        if (e.control === END_KEY) {
          return e.payload;
        } else if (e.control === CANCLE_KEY) {
          return arg.payload;
        }
      }
      throw e;
    });
  }
}
