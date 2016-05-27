import React, { Component, PropTypes } from 'react';
import { observer } from '../../src';
import TodoItem from './TodoItem';

@observer('todos')
export default class Todos extends Component {
  static propTypes = {
    todos: PropTypes.object.isRequired,
  }
  render() {
    const list = this.props.todos.list;
    return (
      <div>
        <ul>
          { list.map(todo => <TodoItem key={todo.id} todo={todo}/>) }
        </ul>
        <div>
          Completed: {list.filter(item => item.completed).length}
        </div>
      </div>
    );
  }
}
