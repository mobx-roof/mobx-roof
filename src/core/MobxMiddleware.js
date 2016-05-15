import Middleware from '../common/Middleware';
import { isRegExp, mapValues } from '../common/utils';
const KEYS = ['before', 'after', 'error', 'filter'];

function toFilter(filter) {
  if (isRegExp(filter)) {
    return ({ type }) => filter.test(type);
  } else if (typeof filter === 'string') {
    return ({ type }) => filter === type;
  } else if (typeof filter === 'function') {
    return filter;
  }
  throw new Error('Middleware filter must be RegExp, String or Function.');
}

export default class MobxMiddleware {
  static toStandardMiddleware(middleware = {}) {
    if (typeof middleware === 'function') {
      return {
        after: middleware,
      };
    } else if (typeof middleware === 'object') {
      middleware = { ...middleware };
      Object.keys(middleware).forEach(key => {
        if (!KEYS.includes(key)) {
          throw new Error(`Middleware key must one of "${KEYS.join(' ,')}"`);
        }
      });
      if (middleware.filter) {
        const filter = toFilter(middleware.filter);
        delete middleware.filter;
        // to filter function
        return mapValues(middleware, (res) => {
          res = Array.isArray(res) ? res : [res];
          return res.map((fn) => {
            return function middlewareFilterMixin({ payload }) {
              if (!filter(...arguments)) return payload;
              return fn(...arguments);
            };
          });
        }, {});
      }
      return middleware;
    }
    throw new Error('Middleware must be a function or object but get ' + middleware);
  }
  constructor() {
    this._before = new Middleware;
    this._after = new Middleware;
    this._error = new Middleware;
  }
  use(...args) {
    const removes = [];
    args.forEach((middleware) => {
      middleware = MobxMiddleware.toStandardMiddleware(middleware);
      Object.keys(middleware).forEach(pos => {
        const cur = this['_' + pos];
        cur.use(middleware[pos]);
        removes.push(() => cur.remove(middleware[pos]));
      });
    });
    return function removeMiddlewares() {
      removes.map(rm => rm());
    };
  }
  execAction({ actionFn, actionArgs = [], actionName, actionContext }) {
    const args = { action: actionName, model: actionContext, type: `${actionContext}.${actionName}` };
    return this._before
      .compose({ ...args, payload: actionArgs, pos: 'before' })
      .then((args) => {
        if (!Array.isArray(args)) {
          throw new Error('[MobxMiddleware] Pre middleware must return aguments');
        }
        return actionFn.apply(actionContext, args);
      })
      .then((payload) => {
        return this._after.compose({ ...args, payload, pos: 'after' });
      })
      .catch((error) => {
        return this._error.compose({ ...args, payload: error, pos: 'error' }).then((error) => {
          if (error instanceof Error) {
            throw error;
          }
        });
      });
  }
}
