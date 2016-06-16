import MobxMiddleware from './MobxMiddleware';
let _middleware = new MobxMiddleware();

export default {
  set(middleware) {
    if (middleware instanceof MobxMiddleware) {
      _middleware = middleware;
    } else {
      throw new Error('Global Middleware must instance of MobxMiddleware.');
    }
  },
  get() {
    return _middleware;
  },
};
