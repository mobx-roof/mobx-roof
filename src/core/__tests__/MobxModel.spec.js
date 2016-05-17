import { expect } from 'chai';
import UserModel from '../../__tests__/helpers/UserModel';

describe('MobxModel', () => {
  let user;
  const initData = {
    isLogin: false,
    password: null,
    username: 'abc',
    userId: null,
    userInfo: {},
  };
  beforeEach(() => {
    user = new UserModel({ username: 'abc' });
  });
  it('toJSON', () => {
    expect(user.toJSON()).to.eql(initData);
  });
  it('stringify', () => {
    expect(user.stringify()).to.eql(JSON.stringify(initData));
  });
  it('map', () => {
    const keys = [];
    user.each((item, key) => {
      keys.push(key);
    });
    expect(keys).to.eql(Object.keys(initData));
  });
  it('dataKeys', () => {
    expect(user.dataKeys).to.eql(Object.keys(initData));
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
        if (times === 2) {
          done();
        }
        return this.username;
      },
    });
    model.username = 'newUsername';
  });
});
