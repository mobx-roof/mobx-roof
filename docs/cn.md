# Mobx-Roof

Mobx-Roof是基于[mobx](https://github.com/mobxjs/mobx)的简单React MVVM框架, 目标是通过更ORM化的思维来管理数据, 如通过`继承`, `重载` 等面向对象方式来实现数据模型的扩展, 并通过`Relation`来实现数据间的关联.

下边完整的例子可以在项目`example`目录中找到

## 基础篇

先看下要实现的效果

![image](https://os.alipayobjects.com/rmsportal/ocoJUnwRTPpvoUv.gif)

### 1.创建模型

我们先通过`createModel`创建一个用户登录数据模型:

- `name`: 定义类名, 类名首字母大写
- `data`: 通过`对象`声明, 并被转换为`observable data`.
- `constants`: 静态只读数据
- `init`: `data` 和 `constants` 初始化之后执行, 第一个参数为`data`返回数据
- `actions`: 定义模型的action, action是对外开放的接口, 可以使用`async/await`处理异步action, action返回值会转换成`Promise`
- `autorun`: 可以在所依赖数据变动时候自动运行定义的函数, 下边例子当User数据发生变化时候会自动保存到localStorage
- 除了以上几个其他的都可以自定义

数据模型还提供了`set`方法可以快速修改多个数据, 而`toJS` 方法可以将数据转换成JSON格式

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
        // 使用set只会触发一次数据变动事件
        this.set({
          userId: res.id,
          isLogin: true,
          // ...
        });
      } else {
        // 直接赋值会触发一次数据变动事件
        this.loginError = res.message;
      }
    },
  },
  autorun: {
    saveToLocalStorage() {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.toJS()));
    },
  },
  // 其他的都是自定义方法
  customMethod() {
  }
});

```

### 2.绑定到react组件

通过`@context`创建一个隔离的数据空间, 并在创建的时候实例化所有声明的Model.

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

### 3.获取action执行状态

通过`getActionState`可以获取任意的action执行状态, 状态里有`loading`和`error`两个字段, 当action开始执行时候状态`loading`为true, 而如果执行失败错误信息会存入`error`中.

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
### 4.拆分react组件, 实现组件间数据共享

下边例子从App组件拆分出了`UserLogin`和`UserDetail`组件, 并通过`@observer` 来订阅父节点context中的数据, `@observer`可以通过`字符串`, `数组字符串` 或`Model`类声明, 字符串会从父context查找数据, 而类声明会做数据强类型校验

```javascript
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

// 这里如果user字段从context获取的类型不是UserModel则会报错
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

## 高级篇

### Model的扩展

- 1.model的继承及重载, 继承后的新Model会拥有父类所有的`data`, `actions` 和 `autorun` 方法

```javascript
import { extendModel } from 'mobx-roof';
import User from './User'
export default extendModel(User, {
  name: 'ChineseUser',
  data: {
    chinese: {
      zodiac: 'dragon',
    },
  },
  actions: {
    async fetchUserInfo() {
      // 重载了 user.fetchUserInfo 方法
      await User.actions.fetchUserInfo.apply(this, arguments);
    },
  },
});

```

- 2.model的嵌套使用

下边例子`Todos`嵌套了`TodoItem`, 嵌套的Model通过`toJS`方法会自动遍历所有Model类数据并做转换

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
      // Add sub model with parent's middleware
      this.list.push(new TodoItem({ text, userId }, this.middleware));
    },
  },
});
```

### Relation

当多个model之间需要互动时候, mobx-roof提供了`Relation`方式, 下边初始化了一个Relation, 其中 `relation.init` 方法会在第一次创建`context`之后执行, `Relation`可以被使用在多个context中且不互相影响

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

把`relation`加到`context`中;

```javascript
import { context } from 'mobx-roof';
import middleware from './middlewares';
import relation from './relations';

@context({ user: UserModel, todos: TodosModel }, { middleware, relation })
export default class App extends Component {
  //...
}
```

relation提供了多种数据监听方式, 如下, 其中回调结果中`payload` 为action返回结果, `action` 为action对应的名字, `context`为对应作用域

- 1.监听一个

```javascript
relation.listen('user.login', ({ context, payload, action }) => {
  console.log('[relation] user.login: ', payload, context);
});
```

- 2.多个匹配

可以使用正则匹配, 或者用`;`分开列举

```javascript
relation.listen(/^user/, ({ action }) => {
  console.log('[relation] user action name: ', action);
});

relation.listen('user.login; user.fetchUserInfo', ({ action }) => {
  // ...
});

```

- 3.多行方式

`->` 表示串联执行, `=>` 会将前一个action结果数据传递到后一个action当成参数

```javascript
relation.listen(`
  # 注释
  user.login -> user.fetchUserInfo;
  user.login => todos.getByUserId
`);
```

- 4.过滤器

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

- 5.relation.autorun

relation 还提供全局的autorun方法, 可以添加多个, 用于处理多个model的复杂关系逻辑

```javascript
relation.autorun((context) => {
  console.log('[autorun] ', context.user.toJS());
  console.log('[autorun] ', context.todos.toJS());
});

```

- 6.relation.use

`use` 可以用于拆分relation便于管理

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

### 中间件的使用

下边是一个简单的日志打印中间件, `before` `after` `error` 分别对应action执行前, 执行后及执行错误, `filter` 可以对action进行过滤, fitler可以是`字符串`, `正则表达式` 或者 `函数`;
```javascript
// Before exec action
function preLogger({ type, payload }) {
  console.log(`${type} params: `, payload.join(', '));
  return payload;
}

// Action exec fail
function errorLogger({ type, payload }) {
  console.log(`${type} error: `, payload.message);
  // 这里如果返回null将阶段后续的错误
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

添加到`@context`中:

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

使用全局的middleware, 这里context默认会使用全局的middleware

```javascript
import { globalMiddleware, context } from 'mobx-roof';
import logger from './logger';
globalMiddleware.use(
  logger,
);

@context({ user: UserModel })
export default class App extends Component {
  //...
}
```

