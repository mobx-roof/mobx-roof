import { Middleware, globalMiddleware } from '../../src';
import logger from './logger';

const middleware = new Middleware;
middleware.use(
  logger,
);

// Set as global
globalMiddleware.set(middleware);

export default middleware;
