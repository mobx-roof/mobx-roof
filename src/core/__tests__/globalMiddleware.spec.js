import { expect } from 'chai';
import globalMiddleware from '../globalMiddleware';
import MobxContext from '../MobxContext';
import MobxModel from '../MobxModel';

describe('globalMiddleware', () => {
  it('global get ', () => {
    const context = new MobxContext();
    const model = new MobxModel();
    expect(context.middleware).to.eql(globalMiddleware);
    expect(model.middleware).to.eql(globalMiddleware);
    expect(context.middleware._after.isEmpty()).to.not.eql(true);
  });
});
