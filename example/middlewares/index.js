import { globalMiddleware } from '../../src';
import logger from './logger';

globalMiddleware.use(
  logger,
);
