import { createModel } from '../../src';
import TodoItem from './TodoItem';
import * as api from '../api';

export default createModel({
  name: 'Todos',
  data: {
    list: [],
  },
  actions: {
    add(text, userId) {
      this.list.push(new TodoItem({ text, userId }));
    },
    async getByUserId(userId) {
      let todos = await api.getTodosByUserId(userId);
      todos = todos.map(todo => new TodoItem(todo));
      this.list = this.list.concat(todos);
    },
  },
});
