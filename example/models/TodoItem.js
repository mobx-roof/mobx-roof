import { createModel } from '../../src';

export default createModel({
  name: 'TodoItem',
  data({ text, userId }) {
    return {
      text,
      userId,
    };
  },
  actions: {
    update(text, userId) {
      this.set({
        text,
        userId,
      });
    },
  },
});
