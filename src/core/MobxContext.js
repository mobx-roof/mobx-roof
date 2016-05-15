import { each, mapValues } from '../common/utils';
import MobxModel, { isMobxModelClass } from './MobxModel';
import MobxMiddleware from './MobxMiddleware';
import MobxRelation from './MobxRelation';
import SimpleEvent from '../common/SimpleEvent';

export default class MobxContext extends SimpleEvent {
  /**
   * @param {Object} contextInitData
   * @param {Object} opts
   *    - parentContext
   *    - middleware
   *    - relation
   *    - transfer
   */
  constructor(contextInitData = {}, opts = {}) {
    super();
    this._middleware = opts.middleware || new MobxMiddleware;
    this._relation = opts.relation || new MobxRelation;
    this._data = mapValues(contextInitData, (Model, name) => {
      // Get from parent context
      if (typeof Model === 'string') {
        if (opts.parentContext) {
          return opts.parentContext.find(Model);
        }
        throw new Error(`Context initData "${Model}" can not find in it's parentContext.`);
      }
      // Get a class
      if (isMobxModelClass(Model)) {
        return new Model(null, this._middleware);
      }
      // Get an instance
      if (Model instanceof MobxModel) {
        // update model's middleware
        Model.middleware = this._middleware;
        return Model;
      }
      throw new Error(`${name} must instance of MobxModel or MobxModel class.`);
    });
    // transfer middleware and relation
    if (opts.parentContext) {
      this.transferFromParentContext(opts.parentContext, opts);
    }
    this._addRelationMiddleware();
  }
  transferFromParentContext(parentContext, opts) {
    this._middleware = parentContext.middleware;
    // transfer customer
    if (opts.transfer) {
      opts.transfer(this, opts.parentContext);
    }
  }
  _addRelationMiddleware() {
    if (this._relationRemove) return;
    const hook = (arg) => {
      const fullname = `${this._findKeyByModel(arg.model)}.${arg.action}`;
      // exec async
      setTimeout(() => {
        this._relation.execInMiddleware({ ...arg, fullname, context: this });
      });
      return arg.payload;
    };
    this._relationRemove = this._middleware.use({
      after: hook,
    });
  }
  set relation(newRelation) {
    this._relation = newRelation;
  }
  get relation() {
    return this._relation;
  }
  get middleware() {
    return this._middleware;
  }
  get data() {
    return this._data;
  }
  destroy() {
    // remove relation middleware
    if (this._relationRemove) {
      this._relationRemove();
      this._relationRemove = null;
    }
  }
  checkMobxModels(mobxModels) {
    if (Array.isArray(mobxModels)) {
      mobxModels.forEach((name) => {
        if (!this._data[name]) {
          throw new Error(`Can not find data "${name}" in MobxContext.`);
        }
      });
    } else {
      each(mobxModels, (MobxModel, name) => {
        if (this._data[name]) {
          if (!isMobxModelClass(MobxModel)) {
            throw new Error(`MobxContext required MobxModel class.`);
          }
          if (!(this._data[name] instanceof MobxModel)) {
            throw new Error(`${name} is not instance of ${MobxModel._name}.`);
          }
        } else {
          throw new Error(`Can not find data "${name}" in MobxContext.`);
        }
      });
    }
  }
  pick(...keys) {
    return keys.reduce((obj, key) => {
      if (!this._data[key]) throw new Error(`Can not find data "${key}" in MobxContext.`);
      obj[key] = this._data[key];
      return obj;
    }, { });
  }
  find(key) {
    if (!this._data[key]) throw new Error(`Can not find data "${key}" in MobxContext.`);
    return this._data[key];
  }
  _findKeyByModel(model) {
    return Object.keys(this._data).find(key => this._data[key] === model);
  }
}
