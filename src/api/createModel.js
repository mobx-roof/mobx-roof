import _MobxModel, { toMobxActions, isMobxModelClass } from '../core/MobxModel';
let uuid = 0;

export default function createModel({ name, data = {}, actions = {} }, Parent = _MobxModel) {
  const mobxActions = toMobxActions(actions);
  if (!isMobxModelClass(Parent)) {
    throw new Error('Parent class must extend From MobxModel.');
  }
  if (!name) {
    throw new Error('createModel need a name.');
  }
  class MobxModel extends Parent {
    static uuid = ++ uuid
    static _name = name
    constructor(_initData = {}, middleware) {
      if (typeof data === 'function') {
        data = data(_initData);
        super(data, middleware);
      } else {
        super({ ...data, ..._initData }, middleware);
      }
    }
  }
  MobxModel.prototype = Object.assign(MobxModel.prototype, mobxActions);
  return MobxModel;
}
