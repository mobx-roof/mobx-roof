import React, { Component } from 'react';
import createContext from '../../api/createContext';
import TodoModel from './TodoModel';
import UserModel from './UserModel';
import ObserverComponent from './ObserverComponent';

@createContext({ user: UserModel, todo: TodoModel })
export default class ContextComponent extends Component {
  render() {
    return (
      <ObserverComponent />
    );
  }
}
