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
      filters: {
        preFilter: val => val,
        afterFilter: val => val,
        getUsername(res) {
          return res && res.username;
        },
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
    expect(() => relation.parsePattern('user.login =$ preFilter')).to.throw(/illegal/);
    expect(relation.parsePattern('|| user.login -> = > -> todo.getList || ')).to.eql(
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
  it('listen type check', () => {
    expect(() => relation.listen()).to.throw(/String or RegExp/);
    expect(() => relation.listen(3)).to.throw(/String or RegExp/);
  });
  it('listen empty should throw error', () => {
    expect(() => relation.listen('')).to.throw(/empty/);
    expect(() => relation.listen(`
      # This is comment
    `)).to.throw(/empty/);
  });
  it('listen single', () => {
    expect(relation.listen(`
      # This is comment
      user.login
    `)._relations[0].pattern).to.eql({
      action: 'user.login',
      refs: ['user'],
      chain: [
        [],
      ],
    });
  });
  it('listen more', () => {
    expect(relation.listen(`user.login;user.getInfo;`)._relations.map(item => item.pattern.action)).to.eql(['user.login', 'user.getInfo']);
  });
  it('undefined action', async(done) => {
    relation.listen(`user.login->user.unKnownAction|afterFilter`, null, ({ payload }) => {
      expect(payload.message).to.match(/not defined/);
      done();
    });
    await context.find('user').login('Lili', '123');
  });
  it('listen and exec', async(done) => {
    relation.listen(`user.login -> user.fetchUserInfo|getUsername`, ({ payload }) => {
      expect(payload).to.eql('Lili');
      done();
    });
    await context.find('user').login('Lili', '123');
  });
  it('listen and exec error', async(done) => {
    const error = new Error('define error');
    relation.listen(`user.login`, () => {
      return new Promise((res, rej) => {
        rej(error);
      });
    }, ({ payload }) => {
      expect(payload).to.eql(error);
      done();
    });
    await context.find('user').login('Lili', '123');
  });
  it('liten with pattern', async(done) => {
    const error = new Error('define error');
    relation.listen(/user/, () => {
      return new Promise((res, rej) => {
        rej(error);
      });
    }, ({ payload }) => {
      expect(payload).to.eql(error);
      done();
    });
    await context.find('user').login('Lili', '123');
  });
  it('listen and arrow split', async (done) => {
    relation.listen(`user.login -> user.fetchUserInfo -> getUsername`, ({ payload }) => {
      expect(payload).to.eql(undefined);
      done();
    });
    await context.find('user').login('Lili', '123');
  });
  it('relation init', (done) => {
    expect(() => relation.init()).to.throw(/need a function/);
    let count = 0;
    relation.init((ctx) => {
      // data loaded
      count ++;
      expect(Object.keys(ctx).length).to.eql(2);
    });
    relation.init(() => {
      count ++;
      expect(count).to.eql(2);
      done();
    });
  });
  it('relation autorun', (done) => {
    let times = 0;
    relation.autorun((ctx) => {
      times ++;
      const user = ctx.user;
      user.toJSON();
      if (times === 2) {
        done();
      }
    });
    setTimeout(() => {
      context.find('user').setName('abc');
    }, 5);
  });
  it('relation use', () => {
    let count = 0;
    expect(() => relation.use('abc')).to.throw(/relation.use need functions/);
    relation.use((r) => {
      expect(r).to.eql(relation);
      count ++;
    }, () => {
      count ++;
    });
    expect(count).to.eql(2);
  });
});
