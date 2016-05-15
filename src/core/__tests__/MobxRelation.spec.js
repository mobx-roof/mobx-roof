import { expect } from 'chai';
import MobxRelation from '../MobxRelation';
import MobxContext from '../MobxContext';
import UserModel from '../../__tests__/helpers/UserModel';
import TodoModel from '../../__tests__/helpers/TodoModel';
describe('MobRelation', () => {
  let relation;
  let context;
  beforeEach(() => {
    relation = new MobxRelation({
      preFilter: val => val,
      afterFilter: val => val,
      getUsername(res) {
        return res && res.username;
      },
    });
    context = new MobxContext({
      user: UserModel,
      todo: new TodoModel,
    }, { relation });
  });
  afterEach(() => {
    context.destroy();
  });
  it('parsePattern', () => {
    expect(() => relation.parsePattern('')).to.throw(/empty/);
    expect(() => relation.parsePattern('user.login => preFilter')).to.throw(/illegal/);
    expect(relation.parsePattern('|| user.login -> || -> todo.getList || ')).to.eql(
      {
        action: 'user.login',
        refs: ['user', 'todo'],
        chain: [[], ['todo.getList']],
      }
    );
    expect(relation.parsePattern('user.login -> preFilter | user.fetchInfo -> todo.getList | afterFilter')).to.eql(
      {
        action: 'user.login',
        refs: ['user', 'todo'],
        chain: [
          [],
          ['preFilter', 'user.fetchInfo'],
          ['todo.getList', 'afterFilter'],
        ],
      }
    );
  });
  it('undefined filter', () => {
    expect(() => relation.parsePattern('user.login | undefinedFilter')).to.throw('Undefined filter');
  });
  it('define empty should throw error', () => {
    expect(() => relation.define('')).to.throw(/empty/);
    expect(() => relation.define(`
      # This is comment
    `)).to.throw(/empty/);
  });
  it('define single', () => {
    expect(relation.define(`
      # This is comment
      user.login
    `)._relations['user.login'][0].pattern).to.eql({
      action: 'user.login',
      refs: ['user'],
      chain: [
        [],
      ],
    });
  });
  it('define more', () => {
    expect(Object.keys(relation.define(`user.login;user.getInfo;`)._relations)).to.eql(['user.login', 'user.getInfo']);
  });
  it('undefined action', async(done) => {
    relation.define(`user.login->user.unKnownAction|afterFilter`, null, ({ payload }) => {
      expect(payload.message).to.match(/not defined/);
      done();
    });
    await context.find('user').login('Lili', '123');
  });
  it('define and exec', async(done) => {
    relation.define(`user.login -> user.fetchUserInfo|getUsername`, ({ payload }) => {
      expect(payload).to.eql('Lili');
      done();
    });
    await context.find('user').login('Lili', '123');
  });
  it('define and exec error', async(done) => {
    const error = new Error('define error');
    relation.define(`user.login`, () => {
      return new Promise((res, rej) => {
        rej(error);
      });
    }, ({ payload }) => {
      expect(payload).to.eql(error);
      done();
    });
    await context.find('user').login('Lili', '123');
  });
  it('define and arrow split', async (done) => {
    relation.define(`user.login -> user.fetchUserInfo -> getUsername`, ({ payload }) => {
      expect(payload).to.eql(undefined);
      done();
    });
    await context.find('user').login('Lili', '123');
  });
});
