import { createModel } from '../../../src';
import * as api from './api';

export default createModel({
  name: 'User',
  data: {
    isLogin: false,
    password: null,
    username: null,
    userId: null,
    userInfo: {},
  },
  actions: {
    async login(username, password) {
      const id = await api.login(username, password);
      this.userId = id;
      this.isLogin = true;
      this.username = username;
      this.password = password;
      return id;
    },
    fetchUserInfo() {
      return api.fetchUserInfo(this.userId);
    },
    setName(username) {
      this.username = username;
    },
  },
});
