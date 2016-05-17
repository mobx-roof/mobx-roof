import _MobxModel, { toMobxActions, isMobxModelClass } from '../core/MobxModel';
let uuid = 0;

export default function createModel({ name, data = {}, actions = {}, autorun = {} }, Parent = _MobxModel) {
  const mobxActions = toMobxActions(actions);
  if (!isMobxModelClass(Parent)) {
    throw new Error('Parent class must extend From MobxModel.');
  }
  if (!name) {
    throw new Error('createModel need a name.');
  }
  class MobxModel extends Parent {
    static uuid = ++ uuid
    constructor(_initData = {}, middleware, _autorun = {}) {
      if (typeof data === 'function') {
        data = data(_initData);
        super(data, middleware, { ...autorun, ..._autorun });
      } else {
        super({ ...data, ..._initData }, middleware, { ...autorun, ..._autorun });
      }
    }
  }
  // Define MobxModel name
  Object.defineProperties(MobxModel, {
    name: {
      enumerable: false,
      configurable: true,
      writable: false,
      value: name,
    },
  });
  MobxModel.prototype = Object.assign(MobxModel.prototype, mobxActions);
  return MobxModel;
}
