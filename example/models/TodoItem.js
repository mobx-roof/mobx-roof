import { createModel } from '../../src';

export default createModel({
  name: 'TodoItem',
  data({ text, userId, completed, id }) {
    return {
      text,
      userId,
      completed,
      id,
    };
  },
  actions: {
    update(text, userId, completed) {
      this.set({
        text,
        userId,
        completed,
      });
    },
    toggleComplete() {
      this.completed = !this.completed;
    },
  },
});
