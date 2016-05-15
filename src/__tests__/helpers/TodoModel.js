import { createModel } from '../../../src';

export default createModel({
  name: 'Todos',
  data: {
    list: [],
  },
  actions: {
    add(userId, title) {
      this.list.push({
        userId,
        title,
      });
    },
  },
});
