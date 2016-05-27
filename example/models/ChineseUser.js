import { extendModel } from '../../src';
import User from './User';

export default extendModel(User, {
  name: 'ChineseUser',
  data: {
    chinese: {
      zodiac: 'dragon',
    },
  },
  actions: {
    // overide User.fetchUserInfo
    async fetchUserInfo() {
      await User.actions.fetchUserInfo.apply(this, arguments);
    },
  },
});
