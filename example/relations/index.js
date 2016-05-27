import { Relation } from '../../src';

const relation = new Relation({
  filters: {
    filter1(payload) {
      return payload;
    },
    filter2(payload) {
      return payload;
    },
  },
});

relation.init((context) => {
  const { user, todos } = context;
  if (user.isLogin) {
    user.fetchUserInfo();
    todos.getByUserId(user.userId);
  }
});

relation.listen('user.login', ({ context, payload }) => {
  console.log('[relation] user.login: ', payload, context);
});

relation.listen(/^user/, ({ action }) => {
  console.log('[relation] user action name: ', action);
});

relation.listen('user.login; user.fetchUserInfo', ({ action }) => {
  console.log(action);
});

relation.listen(`
  ## comment
  user.login -> user.fetchUserInfo;
  user.login | filter1 => filter2 | todos.getByUserId
`);

export default relation;
