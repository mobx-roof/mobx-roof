import React, { Component, PropTypes } from 'react';
import { context } from '../src';
import UserModel from './models/User';
// components
import UserLogin from './components/UserLogin';
import UserDetail from './components/UserDetail';
import middleware from './middlewares';

@context({ user: UserModel }, { middleware })
export default class App extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(UserModel).isRequired,
  }
  render() {
    console.log('render: ');
    this.props.user.toJSON();
    const { user } = this.props;
    if (!user.isLogin) {
      return <UserLogin />;
    }
    return <UserDetail />;
  }
}
