import { expect } from 'chai';
import MobxModel from '../MobxModel';
import { observable } from 'mobx';
import UserModel from '../../__tests__/helpers/UserModel';

describe('MobxModel', () => {
  let user;
  let userJSON;
  beforeEach(() => {
    userJSON = {
      isLogin: false,
      password: null,
      username: 'abc',
      userId: null,
      userInfo: {},
    };
    user = new UserModel({ username: 'abc' });
  });
  it('toJSON', () => {
    expect(user.toJSON()).to.eql(userJSON);
    expect(user.toJSON('isLogin')).to.eql(false);
    expect(user.toJSON('unknownKey')).to.eql(undefined);
    // nested MobxModel
    const model = new MobxModel({
      users: [user, user],
      reg: /reg/,
      num: 1,
      func: () => {},
      mobxVal: observable({ observable: true }),
      nest: {
        nest: {
          user,
        },
      },
    });
    expect(model.users[0] instanceof MobxModel).to.eql(true);
    expect(model.nest.nest.user instanceof MobxModel).to.eql(true);
    const result = {
      users: [userJSON, userJSON],
      reg: /reg/,
      num: 1,
      func: undefined,
      mobxVal: { observable: true },
      nest: { nest: { user: userJSON } },
    };
    expect(model.toJSON()).to.eql(result);
    expect(model.toJSON('users')).to.eql([userJSON, userJSON]);
  });
  it('stringify', () => {
    expect(user.stringify()).to.eql(JSON.stringify(userJSON));
  });
  it('map', () => {
    const keys = [];
    user.each((item, key) => {
      keys.push(key);
    });
    expect(keys).to.eql(Object.keys(userJSON));
  });
  it('dataKeys', () => {
    expect(user.dataKeys).to.eql(Object.keys(userJSON));
  });
  it('getID', () => {
    const user1 = new UserModel;
    const user2 = new UserModel;
    expect(user1.getID()).to.not.eql(user2.getID());
  });
  it('immediately extending from MoboxModel should throw error', () => {
    class ChineseUser extends UserModel {}
    expect(() => {
      return new ChineseUser;
    }).to.throw(/immediately extend/);
  });
  it('model autorun', (done) => {
    let times = 0;
    const model = new UserModel({}, null, {
      autoLoad() {
        times ++;
        this.toJSON();
        expect(times).to.lessThan(3);
        if (times === 2) {
          done();
        }
      },
    });
    model.setName('newUsername');
  });
  it('model set', (done) => {
    let times = 0;
    const model = new UserModel({}, null, {
      autoLoad() {
        times ++;
        this.toJSON();
        expect(times).to.lessThan(3);
        if (times === 2) done();
      },
    });
    model.set({
      username: 'username',
      password: 'password',
      undefine: 'undefined',
    });
    model.set('username', 'username');
  });
});
