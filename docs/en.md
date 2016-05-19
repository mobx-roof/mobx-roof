# Mobx-Roof

Mobx-roof is a simple React MVVM framework based on [mobx](https://github.com/mobxjs/mobx).

### Guide

You can see this example in the `example` folder.

### Base

- 1.Create Model

Create a user login model first:

```javascript
import { createModel } from 'mobx-roof';
import * as api from '../api';

export default createModel({
  name: 'User',
  data() {
    return {
      isLogin: false,
      password: null,
      username: null,
      userId: null,
      loginError: '',
      userInfo: {},
    };
  },
  actions: {
    async login(username, password) {
      const res = await api.login(username, password);
      if (res.success) {
        // "set" can set more values and just trigger data changed once.
        this.set({
          userId: res.id,
          username,
          password,
          isLogin: true,
          loginError: null,
        });
      } else {
        // This can trigger data changed.
        this.loginError = res.message;
      }
    },
  },
});

```

- 2.Bind to react component

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
- 3.Get action state

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
- 4.Split the react component by `@observer`

`@observer` can subsribe data from the parent context.

```javascript
// example/App
import React, { Component, PropTypes } from 'react';
import { context, observer } from 'mobx-roof';
import UserModel from './models/User';

@observer('user')
class UserLogin extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
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
@observer({ user: UserModel })
class UserDetail extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
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

@context({ user: UserModel })
export default class App extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(UserModel).isRequired,
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

- 5.Autorun


```javascript
import { createModel } from '../../src';
import * as api from '../api';
const STORE_KEY = 'mobx-roof';

export default createModel({
  name: 'User',
  data() {
    // Init data from localStorage
    let data = localStorage.getItem(STORE_KEY);
    data = data ? JSON.parse(data) : {};
    return {
      isLogin: false,
      password: null,
      username: null,
      userId: null,
      loginError: '',
      userInfo: {},
      ...data,
    };
  },
  actions: {
    async login(username, password) {
      const res = await api.login(username, password);
      if (res.success) {
        this.set({
          userId: res.id,
          isLogin: true,
          loginError: null,
          username,
          password,
        });
      } else {
        this.loginError = res.message;
      }
    },
    logout() {
      this.set({
        isLogin: false,
        username: null,
        password: null,
      });
    },
  },
  autorun: {
    // Auto save data to localStorage, `toJSON` can trigger this function always if any data changed.
    saveToLocalStorage() {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.toJSON()));
    },
  },
});

```

![image](https://os.alipayobjects.com/rmsportal/ocoJUnwRTPpvoUv.gif)
