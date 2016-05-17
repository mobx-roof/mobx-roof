import React, { Component, PropTypes } from 'react';
import { CONTEXT_NAME } from '../common/constants';
import { observer as originObserver } from 'mobx-react';
import { addMobxContextToComponent, getContextTypes } from '../common/utils';
import MobxContext from '../core/MobxContext';

/**
 * @param {Object} contextInitData
 * @param {Object} opts
 *    - middlewares
 *    - transfer
 *    - subscribe
 * @return {Function}
 */
export default function createContext(contextInitData, opts = {}) {
  const keys = Object.keys(contextInitData);
  return function (WrappedComponent) {
    const ObserverComponent = originObserver(WrappedComponent);
    addMobxContextToComponent(ObserverComponent, Object.keys(contextInitData));
    class ContextContainer extends Component {
      static childContextTypes = {
        [CONTEXT_NAME]: PropTypes.object.isRequired,
        ...getContextTypes(keys),
      }
      constructor() {
        super(...arguments);
        if (contextInitData instanceof MobxContext) {
          this[CONTEXT_NAME] = contextInitData;
        } else {
          const parentContext = this.getParentContext();
          this[CONTEXT_NAME] = new MobxContext(contextInitData, { ...opts, parentContext });
        }
      }
      getChildContext() {
        return {
          [CONTEXT_NAME]: this[CONTEXT_NAME],
          ...this[CONTEXT_NAME].data,
        };
      }
      componentWillUnmount() {
        this[CONTEXT_NAME].destroy();
      }
      getParentContext() {
        return this.context[CONTEXT_NAME];
      }
      render() {
        return <ObserverComponent {...this.props} />;
      }
    }
    return ContextContainer;
  };
}
