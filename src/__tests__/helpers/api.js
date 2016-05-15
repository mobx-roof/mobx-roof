const userDB = [
  { username: 'Lili', from: 'USA', password: '123', id: '1' },
  { username: 'John', from: 'Chinese', password: '123', id: '2' },
];

export function login(username, password) {
  return new Promise((res) => {
    setTimeout(() => {
      res(userDB.find(user => user.username.toLowerCase() === username.toLowerCase() && user.password === password).id);
    }, 10);
  });
}

export function fetchUserInfo(id) {
  return userDB.find(user => user.id === id);
}
