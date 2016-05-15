import { expect } from 'chai';
import Middleware from '../Middleware';
describe('Middleware', () => {
  const actionArg = { action: 'test', payload: 1 };
  let middleware;
  beforeEach(() => {
    middleware = new Middleware;
  });
  it('should work properly', async () => {
    const fn1 = ({ action, payload }) => {
      expect(action).to.eql(actionArg.action);
      expect(payload).to.be.eql(actionArg.payload);
      return { data: 2 };
    };
    middleware.use(fn1);
    const fn2 = function ({ action, payload }) {
      expect(action).to.eql(actionArg.action);
      expect(payload.data).to.be.eql(2);
      return { data: 3 };
    };
    middleware.use(fn2);
    const res = await middleware.compose(actionArg);
    expect(res.data).to.eql(3);
  });
  it('should return init payload if empty', async() => {
    const res = await middleware.compose(actionArg);
    expect(res).to.eql(actionArg.payload);
  });
  it('should catch error', (done) => {
    const error = new Error('An error!');
    middleware.use(() => {
      throw error;
    });
    middleware.compose(actionArg).catch((err) => {
      expect(err).to.eql(error);
      done();
    });
  });
  it('remove middleware', () => {
    const fn = () => {};
    middleware.use([fn]);
    expect(middleware.isEmpty()).to.eql(false);
    middleware.remove([fn]);
    expect(middleware.isEmpty()).to.eql(true);
  });
});
