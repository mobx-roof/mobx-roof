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
      },
      friends: [],
    },
    actions: {
      changeName(name) {
        this.name = name;
      },
    },
  });
  beforeEach(() => {

  });
  it('api.createModel', async () => {
    const user = new User;
    expect(isObservable(user.info)).to.eql(true);
    expect(isObservable(user.info.habits)).to.eql(true);
    expect(user.name).to.eql('initName');
    let cache;
    let times = 0;
    autorun(() => {
      times ++;
      cache = user.friends.join('') + ' and ' + user.name + ' are in ' + user.info.address;
    });
    await user.changeName('me');
    user.friends.push('Jack');
    expect(times).to.eql(3);
    user.info.address = 'NanJing';
    expect(times).to.eql(4);
    expect(cache).to.eql('Jack and me are in NanJing');
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
