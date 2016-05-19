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
    actions: {
      changeName(name) {
        this.name = name;
      },
    },
  }); it('api.createModel', async () => {
    const user = new User;
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
      times ++;
      return user.friends.join('') + ' and ' + user.name + ' are in ' + user.info.address + user.info.habits.join(',');
    });
    await user.changeName('me');
    user.friends.push('Jack');
    expect(times).to.eql(3);
    user.info.address = 'NanJing';
    expect(times).to.eql(4);
    user.info.habits.push('swim');
    expect(times).to.eql(4);
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
      data: {
        chinese: {
          zodiac: 'dragon',
        },
        friends: [],
        info: 'from china',
      },
      actions: {
        rename() {},
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
  it('api.createContext', () => {
    const output = renderContext();
    expect(Object.keys(output.props)).to.eql(['user', 'todo']);
  });
});
