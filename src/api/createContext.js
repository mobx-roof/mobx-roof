import React, { Component, PropTypes } from 'react';
import { CONTEXT_NAME } from '../common/constants';
import { observer as originObserver } from 'mobx-react';
import { addMobxContextToComponent } from '../common/utils';
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
  return function (WrappedComponent) {
    const ObserverComponent = originObserver(WrappedComponent);
    addMobxContextToComponent(ObserverComponent);
    class ContextContainer extends Component {
      static childContextTypes = {
        [CONTEXT_NAME]: PropTypes.object.isRequired,
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
        };
      }
      componentWillUnmount() {
        this[CONTEXT_NAME].destroy();
      }
      getParentContext() {
        return this.context[CONTEXT_NAME];
      }
      render() {
        return <ObserverComponent {...this[CONTEXT_NAME].data} {...this.props} />;
      }
    }
    return ContextContainer;
  };
}
