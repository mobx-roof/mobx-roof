import { expect } from 'chai';
import MobxContext from '../MobxContext';
import UserModel from '../../__tests__/helpers/UserModel';
import TodoModel from '../../__tests__/helpers/TodoModel';
describe('MobContext', () => {
  let context;
  beforeEach(() => {
    context = new MobxContext({
      user: UserModel,
      todo: new TodoModel,
    });
  });
  it('create', () => {
    expect(context.data.user).to.instanceOf(UserModel);
    expect(context.data.todo).to.instanceOf(TodoModel);
    expect(() => new MobxContext({ user: {} })).to.throw(/must instance of MobxModel/);
  });
  it('destroy', () => {
    // add middleware
    expect(context.middleware._after.isEmpty()).to.eql(false);
    context.destroy();
    expect(context.middleware._after.isEmpty()).to.eql(true);
  });
  it('find and pick', () => {
    expect(context.data.user).to.eql(context.find('user'));
    expect({ user: context.data.user }).to.eql(context.pick('user'));
    expect(() => context.find('unknown')).to.throw(/Can not find/);
    expect(() => context.pick('unknown')).to.throw(/Can not find/);
  });
  it('parentContext', () => {
    const childContext = new MobxContext({ myUser: 'user' }, { parentContext: context });
    expect(childContext.middleware).to.eql(context.middleware);
    expect(childContext.find('myUser')).to.eql(context.find('user'));
    expect(() => new MobxContext({ user: 'unKnown' })).to.throw(/InitData "unKnown"/);
  });
});
