import { createModel } from '../../src';
// import TodoItem from './TodoItem';

export default createModel({
  name: 'Todos',
  data() {
    return {
      list: [],
    };
  },
  actions: {
  },
});
