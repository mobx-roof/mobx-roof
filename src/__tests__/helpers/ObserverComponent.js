import React, { Component } from 'react';
import createObserver from '../../api/createObserver';
import TodoModel from './TodoModel';
import UserModel from './UserModel';

@createObserver({ user: UserModel, todo: TodoModel })
export default class ObserverComponent extends Component {
  render() {
    return (
      <div>
      </div>
    );
  }
}
