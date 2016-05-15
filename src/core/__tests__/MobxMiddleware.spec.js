import MobxMiddleware from '../MobxMiddleware';
import UserModel from '../../__tests__/helpers/UserModel';
import { expect } from 'chai';
describe('MobxMiddleware', () => {
  let middleware;
  beforeEach(() => {
    middleware = new MobxMiddleware;
  });
  it('execAction', async () => {
    const _action = {
      actionName: 'actionName',
      actionFn(...args) {
        expect(args).to.eql([2, 4, 6]);
        return args.reduce((val, arg) => val + arg, 0);
      },
      actionArgs: [1, 2, 3],
    };
    middleware.use({
      before({ action, payload }) {
        expect(action).to.eql(_action.actionName);
        expect(payload).to.eql(_action.actionArgs);
        return payload.map((arg) => arg * 2);
      },
      after({ action, payload }) {
        expect(action).to.eql(_action.actionName);
        expect(payload).to.eql(12);
        return payload * 2;
      },
    });
    const result = await middleware.execAction(_action);
    expect(result).to.eql(24);
  });
  it('remove middleware', () => {
    const removeFn = middleware.use({
      before() {},
      after() {},
      error() {},
    });
    expect(middleware._before.isEmpty()).to.eql(false);
    removeFn();
    expect(middleware._before.isEmpty()).to.eql(true);
  });
  it('filter type check', () => {
    expect(() => {
      middleware.use({ filter: 123 });
    }).to.throw(/filter must be/);
    expect(() => {
      middleware.use({ filter: [] });
    }).to.throw(/filter must be/);
  });
  it('filter transformer', async () => {
    const fn = ({ payload }) => payload + '!';
    async function checkFilter(filter, actionName) {
      middleware.use({
        after: [fn, fn],
        filter,
      });
      const result = await middleware.execAction({
        actionName,
        actionFn() { return 'done'; },
        actionContext: new UserModel,
      });
      middleware = new MobxMiddleware;
      return result === 'done!!';
    }
    const checker = ({ type }) => /login/.test(type);
    expect(await checkFilter('User.login', 'login')).to.eql(true);
    expect(await checkFilter(/login/, 'login')).to.eql(true);
    expect(await checkFilter(checker, 'login')).to.eql(true);
    expect(await checkFilter('User.login', 'other')).to.eql(false);
    expect(await checkFilter(/login/, 'other')).to.eql(false);
    expect(await checkFilter(checker, 'other')).to.eql(false);
  });
});
