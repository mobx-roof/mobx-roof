import _MobxModel, { toMobxActions, isMobxModelClass } from '../core/MobxModel';
import { nameToUpperCase } from '../common/utils';
let uuid = 0;

export default function createModel({ name, data = {}, constants = {}, actions = {}, autorun = {} }, Parent = _MobxModel) {
  const mobxActions = toMobxActions(actions);
  if (!isMobxModelClass(Parent)) {
    throw new Error('[createModel] Parent class must extend From MobxModel.');
  }
  if (!name) {
    throw new Error('[createModel] need a name.');
  }
  class MobxModel extends Parent {
    static uuid = ++ uuid
    static actions = actions
    static autorun = autorun
    constructor(_initData = {}, middleware, _autorun = {}, _constants) {
      const _data = typeof data === 'function' ? data(_initData) : { ...data, ..._initData };
      super(_data, middleware, { ...autorun, ..._autorun }, { ...constants, ..._constants });
    }
  }
  // Define MobxModel name
  Object.defineProperties(MobxModel, {
    name: {
      enumerable: false,
      configurable: true,
      writable: false,
      value: nameToUpperCase(name),
    },
  });
  MobxModel.prototype = Object.assign(MobxModel.prototype, mobxActions);
  return MobxModel;
}
