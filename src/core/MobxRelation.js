import { compose } from '../common/utils';
import { autorun } from 'mobx';
const emptyFn = () => {};

function spliter(target, keys, fn) {
  if (keys.length === 0) return fn(target);
  return target.split(keys[0]).map(item => spliter(item, keys.slice(1), fn)).filter(item => item);
}
function isActionKey(key) {
  return key && key.split('.').length === 2;
}

function checkFilters(filters) {
  if (typeof filters === 'object') {
    Object.keys(filters).forEach((key) => {
      const filter = filters[key];
      if (typeof filter !== 'function') {
        throw new TypeError(`[MobxRelation] filter "${key}" must be a function`);
      }
    });
  } else {
    throw new TypeError('[MobxRelation] filters must be an Object.');
  }
}
/**
 * regexp support
 */
export default class MobxRelation {
  constructor(filters = {}) {
    this._relations = {};
    this._filters = {};
    this._init = null;
    this._autoruns = [];
    this.addFilters(filters);
  }
  addFilters(filters) {
    checkFilters(filters);
    this._filters = { ...this._filters, ...filters };
  }
  init(initFn) {
    if (typeof initFn === 'function') {
      this._init = initFn;
    } else {
      throw new Error('[MobxRelation] Relation init need a function.');
    }
  }
  autorun(autorun) {
    if (typeof autorun === 'function') {
      this._autoruns.push(autorun);
    } else {
      throw new Error('[MobxRelation] Relation autorun need a function.');
    }
  }
  triggerAutorun(context) {
    this._autoruns.forEach(fn => {
      autorun(fn.bind(null, context));
    });
  }
  triggerInit(context) {
    if (this._init) this._init(context);
  }
  listen(patterns, fn, errorFn) {
    if (typeof patterns === 'string') {
      patterns = patterns
        .split(/\r?\n/)
        // filter "#..." comments
        .filter(item => item && !/^\s*#.*$/.test(item)).join('')
        .replace(/\s*/g, '')
        .split(';')
        .filter(item => item);
      if (patterns.length === 0) {
        throw new Error('[MobxRelation] Relation pattern can not be empty.');
      }
      patterns.forEach(pattern => this._addRelation(pattern, fn, errorFn));
    } else {
      // todo add regExp
    }
    return this;
  }
  execInMiddleware({ fullname, payload, context }) {
    let relations;
    if (relations = this._relations[fullname]) {
      relations.forEach(({ pattern, fn, errorFn }) => {
        try {
          let chain = [];
          pattern.chain.forEach((item, index) => {
            chain = chain.concat(item);
            if (pattern.chain.length - 1 !== index) {
              chain.push(emptyFn);
            }
          });
          chain = chain.map((key) => {
            if (typeof key === 'string') {
              if (isActionKey(key)) {
                const [name, action] = key.split('.');
                const model = context.find(name);
                if (model[action]) {
                  return model[action].bind(model);
                }
                throw new Error(`[MobxRelation] Action "${key}" is not defined.`);
              }
              return this._filters[key];
            }
            return key;
          });
          compose(chain, payload)
            .then(res => fn({ context, payload: res }))
            .catch(e => errorFn({ context, payload: e }));
        } catch (e) {
          errorFn({ context, payload: e });
        }
      });
    }
  }

  parsePattern(pattern) {
    pattern = pattern.replace(/\s*/g, '');
    if (!pattern) {
      throw new Error(`[MobxRelation] Relation pattern can not be empty.`);
    }
    if (!/^[\*\->\.a-zA-Z_\|]+$/.test(pattern)) {
      throw new Error(`[MobxRelation] Relation pattern "${pattern}" illegal.`);
    }
    const refs = [];
    const chain = spliter(pattern, ['->', '|'], (key) => {
      if (isActionKey(key)) {
        const modelName = key.split('.')[0];
        if (!refs.includes(modelName)) refs.push(modelName);
      } else if (key && !this._filters[key]) {
        throw new Error(`[MobxRelation] Undefined filter "${key}"`);
      }
      return key;
    }).filter(item => item.length !== 0);
    const action = chain[0][0];
    if (!action || !isActionKey(action)) {
      throw new Error('[MobxRelation] Relation pattern need an dispatcher action.');
    }
    chain[0] = chain[0].slice(1);
    return {
      action,
      refs,
      chain,
    };
  }

  _addRelation(pattern, fn, errorFn) {
    pattern = this.parsePattern(pattern);
    const action = pattern.action;
    if (!this._relations[action]) {
      this._relations[action] = [];
    }
    this._relations[action].push({
      pattern,
      fn: fn || emptyFn,
      errorFn: errorFn || function ({ payload }) { throw payload; },
    });
  }
}
