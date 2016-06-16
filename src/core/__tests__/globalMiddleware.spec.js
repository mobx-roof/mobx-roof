import { expect } from 'chai';
import globalMiddleware from '../globalMiddleware';
import MobxMiddleware from '../MobxMiddleware';
import MobxContext from '../MobxContext';
import MobxModel from '../MobxModel';

describe('globalMiddleware', () => {
  it('global get ', () => {
    const context = new MobxContext();
    const model = new MobxModel();
    expect(context.middleware).to.eql(globalMiddleware.get());
    expect(model.middleware).to.eql(globalMiddleware.get());
    expect(context.middleware._after.isEmpty()).to.not.eql(true);
  });
  it('global set type check', () => {
    expect(() => globalMiddleware.set({})).to.throw(/must instance of MobxMiddleware/);
  });
  it('global set', () => {
    const middleware = new MobxMiddleware();
    globalMiddleware.set(middleware);
    const context = new MobxContext();
    const model = new MobxModel();
    expect(context.middleware).to.eql(middleware);
    expect(model.middleware).to.eql(middleware);
    expect(middleware._after.isEmpty()).to.not.eql(true);
    context.destroy();
    expect(middleware._after.isEmpty()).to.eql(true);
  });
});
