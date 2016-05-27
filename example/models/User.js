import { createModel } from '../../src';
import * as api from '../api';
const STORE_KEY = 'mobx-roof';

export default createModel({
  name: 'User',
  data() {
    // InitData from localStorage
    let data = localStorage.getItem(STORE_KEY);
    data = data ? JSON.parse(data) : {};
    return {
      isLogin: false,
      password: null,
      username: null,
      userId: null,
      loginError: '',
      habits: [],
      from: null,
      ...data,
    };
  },
  actions: {
    async login(username, password) {
      const res = await api.login(username, password);
      if (res.success) {
        this.set({
          userId: res.id,
          isLogin: true,
          loginError: null,
          username,
          password,
        });
      } else {
        this.loginError = res.message;
      }
    },
    async fetchUserInfo() {
      const res = await api.fetchUserInfo(this.userId);
      this.set({
        from: res.from,
        habits: res.habits,
      });
    },
    logout() {
      this.set({
        isLogin: false,
        username: null,
        password: null,
        userId: null,
      });
    },
  },
  autorun: {
    // this.toJS can listen all data changed
    saveToLocalStorage() {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.toJS()));
    },
  },
});
