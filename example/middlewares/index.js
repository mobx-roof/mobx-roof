import { Middleware } from '../../src';
import logger from './logger';

const middleware = new Middleware;
middleware.use(
  logger,
);

export default middleware;
