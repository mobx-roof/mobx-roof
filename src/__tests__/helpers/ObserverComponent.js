import React, { Component } from 'react';
import createObserver from '../../api/createObserver';
import TodoModel from './TodoModel';
import UserModel from './UserModel';

@createObserver(['user', 'todo'])
export default class ObserverComponent extends Component {
  render() {
    console.log('gaga')
    return (
      <div>
      </div>
    );
  }
}
