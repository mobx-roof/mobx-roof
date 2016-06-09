# Mobx-Roof

Mobx-roof is a simple React MVVM framework based on [mobx](https://github.com/mobxjs/mobx).

## Guide

You can see this example in the `example` folder.

## Base

![image](https://os.alipayobjects.com/rmsportal/ocoJUnwRTPpvoUv.gif)

### 1.Create Model

- `name`: define class name capitalized.
- `data`: data must be declare as `Object`, it will transfer to mobx `observable data`.
- `constants`: an `Object` of read only data.
- `init`: exec after `data` and `constants` , ther fist param is from `data` returns.
- `actions`: define actions to change `observer data`, action return a `Promise`.
- `autorun`: can run any function automatically.
- Other any custom methods.

```javascript
import { createModel } from 'mobx-roof';
import * as api from '../api';
const STORE_KEY = 'mobx-roof';

export default createModel({
  name: 'User',
  constants: {
    type: 'USER',
  },
  data: {
    isLogin: false,
    password: null,
    username: null,
    userId: null,
    loginError: '',
    habits: [],
    from: null,
  },
  init(initData) {
    // InitData from localStorage
    let data = localStorage.getItem(STORE_KEY);
    data = data ? JSON.parse(data) : {};
    // constants ignore
    delete data.type;
    this.set({
      ...data,
    });
  }
  actions: {
    async login(username, password) {
      const res = await api.login(username, password);
      if (res.success) {
        // "set" can set more values and just trigger data changed once.
        this.set({
          userId: res.id,
          isLogin: true,
          // ...
        });
      } else {
        // This also can trigger data changed.
        this.loginError = res.message;
      }
    },
  },
  autorun: {
    saveToLocalStorage() {
      // "toJS" get a JSON data
      localStorage.setItem(STORE_KEY, JSON.stringify(this.toJS()));
    },
  },
  // Any custom method
  customMethod() {
  }
});

```

### 2.Bind data to react component

Use `@context` can create a isolate data space.

```javascript
import React, { Component, PropTypes } from 'react';
import { context } from 'mobx-roof';
import UserModel from './models/User';

@context({ user: UserModel })
export default class App extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(UserModel).isRequired,
  }
  login() {
    this.props.user.login(this.refs.username.value, this.refs.password.value);
  }
  render() {
    const { user } = this.props;
    if (!user.isLogin) {
      return (
        <div className="container">
          <div>
            username:  <input ref="username" type="text" placeholder="Jack"/>
            password:  <input ref="password" type="password" placeholder="123"/>
            <button onClick={::this.login}>login</button>
            <span style={{color: 'red'}}>{user.loginError}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="container">
        Welcome! {user.username}
      </div>
    );
  }
}

```
### 3.Get action state by `getActionState`

```javascript
@context({ user: UserModel })
export default class App extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(UserModel).isRequired,
  }
  login() {
    this.props.user.login(this.refs.username.value, this.refs.password.value);
  }
  render() {
    const { user } = this.props;
    const { loading: loginLoading, error: loginError } = user.getActionState('login');
    if (!user.isLogin) {
      return (
        <div className="container">
          <div>
            username:<input ref="username" type="text" placeholder="Jack"/>
            password:<input ref="password" type="password" placeholder="123"/>
            <button onClick={::this.login}>login</button>
            {loginLoading
              ? <span>loading...</span>
              : <span style={{ color: 'red' }}>{(loginError && loginError.message) || user.loginError}</span>
            }
          </div>
        </div>
      );
    }
    return (
      <div className="container">
        Welcome! {user.username}
      </div>
    );
  }
}
```
### 4.Split the react component by `@observer`

`@observer` can subsribe data from the parent context. Parameter can be a `String`, `Array of String` or `Object` of Model class.

```javascript
// example/App
import React, { Component, PropTypes } from 'react';
import { context, observer } from 'mobx-roof';
import UserModel from './models/User';

@observer('user', 'todos')
class UserLogin extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    todos: PropTypes.object.isRequired,
  }
  login() {
    this.props.user.login(this.refs.username.value, this.refs.password.value);
  }
  render() {
    const { user } = this.props;
    const { loading: loginLoading, error: loginError } = user.getActionState('login');
    return (
      <div className="container">
        <div>
          username:<input ref="username" type="text" placeholder="Jack"/>
          password:<input ref="password" type="password" placeholder="123"/>
          <button onClick={::this.login}>login</button>
          {loginLoading
            ? <span>loading...</span>
            : <span style={{ color: 'red' }}>{(loginError && loginError.message) || user.loginError}</span>
          }
        </div>
      </div>
    );
  }
}

// It should throw Error if user is not instance of UserModel
@observer({ user: UserModel, todos: TodosModel })
class UserDetail extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    todos: PropTypes.object.isRequired,
  }
  logout() {
    this.props.user.logout();
  }
  render() {
    return (
      <div className="container">
        Welcome! {this.props.user.username}
        <button onClick={::this.logout}>logout</button>
      </div>
    );
  }
}

@context({ user: UserModel, todos: TodosModel })
export default class App extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(UserModel).isRequired,
    todos: PropTypes.instanceOf(TodosModel).isRequired,
  }
  render() {
    const { user } = this.props;
    if (!user.isLogin) {
      return <UserLogin />;
    }
    return <UserDetail />;
  }
}

```

## More

### Model extends

- 1.Model extends and overide

```javascript
import { extendModel } from 'mobx-roof';
import User from './User'
export default extendModel(User, {
  name: 'ChineseUser',
  // Declare by Object or Function
  data: {
    chinese: {
      zodiac: 'dragon',
    },
  },
  actions: {
    async fetchUserInfo() {
      // Overide user.fetchUserInfo
      await User.actions.fetchUserInfo.apply(this, arguments);
    },
  },
});

```

- 2.Model with SubModel

```javascript
import * as api from '../api';

const TodoItem = createModel({
  name: 'TodoItem',
  data: {
    text: '',
    userId: null,
    completed: false,
    id: null,
  },
  init(initData) {
    this.set({
      ...initData,
    });
  },
});

export default createModel({
  name: 'Todos',
  data() {
    return {
      list: [],
    };
  },
  actions: {
    add(text, userId) {
      // Add sub model
      this.list.push(new TodoItem({ text, userId }));
    },
  },
});
```

### Relation

`relation.init`

```javascript
import { Relation } from 'mobx-roof';
const relation = new Relation;

relation.init((context) => {
  const { user, todos } = context;
  console.log(user); // userModel instance
  console.log(todos); // todoModel instance
});
export default relation;
```

Add `relation` to `@context`;

```javascript
import { context } from 'mobx-roof';
import middleware from './middlewares';
import relation from './relations';

@context({ user: UserModel, todos: TodosModel }, { middleware, relation })
export default class App extends Component {
  //...
}
```

`Relation` provides a variety of data monitoring methods, as follows, `payload`  as action result, `action`  as action name, `context` is current context.

- 1.Listen one

```javascript
relation.listen('user.login', ({ context, payload, action }) => {
  console.log('[relation] user.login: ', payload, context);
});
```

- 2.Listen more

RegExp or with a semicolon separated list.

```javascript
relation.listen(/^user/, ({ action }) => {
  console.log('[relation] user action name: ', action);
});

relation.listen('user.login; user.fetchUserInfo', ({ action }) => {
  // ...
});

```

- 3.Multi line

`->`: Execute in order
`=>`: The previous action results will be transferred to the next action as a parameter

```javascript
relation.listen(`
  # comment
  user.login -> user.fetchUserInfo;
  user.login => todos.getByUserId
`);
```

- 4.filters

```javascript
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
relation.listen(`
  ## comment
  user.login -> user.fetchUserInfo;
  user.login | filter1 => filter2 | todos.getByUserId
`);

```

- 5.Relation.autorun

`Relation` provides global `autorun` and can add multiple times.

```javascript
relation.autorun((context) => {
  console.log('[autorun] ', context.user.toJS());
  console.log('[autorun] ', context.todos.toJS());
});

```

- 6.relation.use

`use` can split the relation

```javascript
function userLoginListen(relation) {
  relation.init(() => {} );
  relation.listen('user.login', () => {});
}
function autoruns(relation) {
  relation.init(() => {} );
  relation.autorun(() => {});
}

relation.use(listenUserLogin, autoruns);
```

### Middleware

Below is a simple logger Middleware, `filter` can be `String`, `RegExp` or `function`;

```javascript
// Before exec action
function preLogger({ type, payload }) {
  console.log(`${type} params: `, payload.join(', '));
  return payload;
}

// Action exec fail
function errorLogger({ type, payload }) {
  console.log(`${type} error: `, payload.message);
  // If null returns the error that will be stop.
  return payload;
}

// After exec action
function afterLogger({ type, payload }) {
  console.log(`${type} result: `, payload);
  return payload;
}

export default {
  filter({ type }) {
    return /^User/.test(type);
  },
  before: preLogger,
  after: afterLogger,
  error: errorLogger,
};

```

Add to `@context`:

```javascript
import { Middleware, context } from 'mobx-roof';
import logger from './logger';
const middleware = new Middleware;
middleware.use(
  logger,
);
@context({ user: UserModel }, { middleware })
export default class App extends Component {
  //...
}
```
