import React, { Component, PropTypes } from 'react';
import { observer } from '../../src';

@observer('user')
export default class UserLogin extends Component {
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
