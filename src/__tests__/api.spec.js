import { createModel, extendModel } from '../index';
import { expect } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import ContextComponent from './helpers/ContextComponent';
import { autorun, isObservable } from 'mobx';
function renderContext(props = {}) {
  const renderer = TestUtils.createRenderer();
  renderer.render(<ContextComponent {...props} />);
  return renderer.getRenderOutput();
}
describe('mobx-roof', () => {
  const actions = {
    changeName(name) {
      this.name = name;
    },
  };
  const User = createModel({
    name: 'User',
    data: {
      name: 'initName',
      info: {
        address: 'beijing',
        habits: [],
        other: {
          age: 33,
        },
      },
      friends: [{
        name: 'Jack',
      }],
    },
    actions,
  });
  it('api.createModel', async() => {
    const user = new User;
    expect(User.actions).to.eql(actions);
    expect(isObservable(user)).to.eql(true);
    expect(isObservable(user.info)).to.eql(true);
    expect(isObservable(user.friends)).to.eql(true);
    expect(isObservable(user.name)).to.eql(false);
    expect(isObservable(user.info.habits)).to.eql(false);
    expect(isObservable(user.info.other)).to.eql(false);
    expect(isObservable(user.friends[0])).to.eql(false);
    expect(user.name).to.eql('initName');
    let times = 0;
    autorun(() => {
      times++;
      user.toJSON();
    });
    await user.changeName('me');
    user.friends.push('Jack');
    expect(times).to.eql(3);
    user.info.address = 'NanJing';
    expect(times).to.eql(4);
    user.info.habits.push('swim');
    expect(times).to.eql(4);
    user.info = { habits: [] };
    expect(isObservable(user.info.habits)).to.eql(false);
  });
  it('api.createModel with action defined', () => {
    const User = createModel({
      name: 'User',
      data: {
        login: true,
      },
      actions: {
        login() {
        },
      },
    });
    expect(() => new User).to.throw(/is defined in action/);
  });
  it('api.extendModel', () => {
    const ChineseUser = extendModel(User, {
      name: 'ChineseUser',
      data: {
        chinese: {
          zodiac: 'dragon',
        },
        friends: [],
        info: 'from china',
      },
      actions: {
        rename() {
        },
      },
    });
    expect(ChineseUser.uuid).to.not.eql(User.uuid);
    const user = new ChineseUser({ name: 'Jim' });
    expect(user.toJSON()).to.eql({
      name: 'Jim',
      info: 'from china',
      friends: [],
      chinese: {
        zodiac: 'dragon',
      },
    });
    expect(user.rename).to.instanceOf(Function);
  });
  it('api.extendModel by data function', () => {
    let count = 0;
    const Panel = createModel({
      name: 'Panel',
      data(initData) {
        return {
          tabName: '',
          id: count++,
          ...initData,
        };
      },
    });
    const PagePanel = extendModel(Panel, {
      name: 'PagePanel',
      data(initData) {
        return {
          tabName: 'page',
          content: 'abc',
          ...initData,
        };
      },
    });
    const panel = new PagePanel;
    expect(panel.toJSON()).to.eql({
      tabName: 'page',
      content: 'abc',
      id: 0,
    });
  });
  it('name check and name to Uppercase', () => {
    const User = createModel({
      name: 'user',
    });
    expect(User.name).to.eql('User');
    expect(() => extendModel(User, {})).to.throw(/need a name/);
    expect(() => createModel({})).to.throw(/need a name/);
    expect(extendModel(User, { name: 'extendUser' }).name).to.eql('ExtendUser');
  });
  it('api.createModel constants', () => {
    const struct = {
      name: 'User',
      constants: {
        from: 'China',
      },
    };
    const UserModel = createModel(struct);
    const User2Model = createModel({
      ...struct,
      actions: {
        from() {
        },
      },
    });
    const user = new UserModel;
    expect(user.from).to.eql('China');
    expect(user.toJSON()).to.eql({ from: 'China' });
    expect(() => user.from = 'USA').to.throw(/read only/);
    expect(() => new User2Model()).to.throw(/defined in actions/);
  });
  it('api.createModel constants conflicted', () => {
    const UserModel = createModel({
      name: 'User',
      constants: {
        from: 'China',
      },
      data: {
        from: 'China',
      },
    });
    expect(() => new UserModel).to.throw(/is defined in constants/);
  });
  it('api.extendModel constants', () => {
    const UserModel = createModel({
      name: 'User',
      constants: {
        from: 'China',
      },
    });
    const USAModel = extendModel(UserModel, {
      name: 'USAUser',
      constants: {
        from: 'USA',
        other: 'other',
      },
    });
    const IndiaModel = extendModel(USAModel, {
      name: 'IndiaUser',
      constants: {
        from: 'India',
        isChild: true,
      },
    });
    const user = new IndiaModel;
    expect(user.toJSON()).to.eql({
      other: 'other',
      from: 'India',
      isChild: true,
    });
  });
  it('api.createContext', () => {
    const output = renderContext();
    expect(Object.keys(output.props)).to.eql(['user', 'todo']);
  });
  it('mobx action run times', async () => {
    let times = 0;
    const Pos = createModel({
      name: 'Pos',
      data: {
        x: 1,
        y: 2,
      },
      actions: {
        setPos() {
          this.x ++;
          this.y ++;
        },
        setPos2() {
          this.set({ x: this.x + 1, y: this.y + 1 });
        },
      },
      autorun: {
        run() {
          times ++;
          return this.toJSON();
        },
      },
    });
    const pos = new Pos;
    await pos.setPos();
    await pos.setPos2();
    expect(times).to.eql(3);
  });
});
