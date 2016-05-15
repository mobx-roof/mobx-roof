export default class SimpleEvent {
  constructor() {
    this._listeners = [];
  }
  subscribe(listener) {
    const _listeners = this._listeners;
    _listeners.push(listener);
    return this.unSubscribe.bind(this, listener);
  }
  unSubscribe(listener) {
    const index = this._listeners.indexOf(listener);
    this._listeners.splice(index, 1);
  }
  dispatch(...args) {
    this._listeners.forEach(listener => listener(...args));
  }
}
