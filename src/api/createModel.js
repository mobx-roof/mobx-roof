import _MobxModel, { toMobxActions, isMobxModelClass } from '../core/MobxModel';
import { nameToUpperCase, inherits, classCallCheck, possibleConstructorReturn } from '../common/utils';
let uuid = 0;

export default function createModel({ name, data = {}, constants = {}, actions = {}, autorun = {} }, Parent = _MobxModel) {
  const mobxActions = toMobxActions(actions);
  if (!isMobxModelClass(Parent)) {
    throw new Error('[createModel] Parent class must extend From MobxModel.');
  }
  if (!name) {
    throw new Error('[createModel] need a name.');
  }
  function MobxModel(_initData = {}, middleware, _autorun = {}, _constants) {
    classCallCheck(this, MobxModel);
    const _data = typeof data === 'function' ? data.call(this, _initData) : { ...data, ..._initData };
    return possibleConstructorReturn(this, Object.getPrototypeOf(MobxModel).call(this, _data, middleware, { ...autorun, ..._autorun }, { ...constants, ..._constants }));
  }
  MobxModel.uuid = ++ uuid;
  MobxModel.actions = actions;
  MobxModel.autorun = autorun;
  inherits(MobxModel, Parent);
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
