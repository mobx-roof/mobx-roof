import React, { Component, PropTypes } from 'react';
import { context } from '../src';
import UserModel from './models/User';
import TodosModel from './models/Todos';
// components
import UserLogin from './components/UserLogin';
import UserDetail from './components/UserDetail';
import Todos from './components/Todos';
import middleware from './middlewares';
import relation from './relations';

@context({ user: UserModel, todos: TodosModel }, { middleware, relation })
export default class App extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(UserModel).isRequired,
  }
  render() {
    this.props.user.toJSON();
    const { user } = this.props;
    if (!user.isLogin) {
      return <UserLogin />;
    }
    return (
      <div>
        <UserDetail />
        <Todos />
      </div>
    );
  }
}
