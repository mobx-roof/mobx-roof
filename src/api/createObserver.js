import React, { Component } from 'react';
import { observer as originObserver } from 'mobx-react';
import { addMobxContextToComponent } from '../common/utils';
import { CONTEXT_NAME } from '../common/constants';
/**
 * @param {String | Array<String> | Object } mobxModels
 * @returns {Function}
 */
export default function createObserver(mobxModels = {}) {
  let modelKeys;
  if (typeof mobxModels === 'string') {
    mobxModels = [mobxModels];
  }
  if (Array.isArray(mobxModels)) {
    modelKeys = mobxModels;
  } else {
    modelKeys = Object.keys(mobxModels);
  }
  return function (WrappedComponent) {
    const ObserverComponent = originObserver(WrappedComponent);
    class ObserverContainer extends Component {
      constructor() {
        super(...arguments);
        if (!this.getMobxContext()) {
          throw new Error('[@Observer] Please Add decorator "@Context(...)" in your Root Component.');
        }
        this.getMobxContext().checkMobxModels(mobxModels);
      }
      getMobxContext() {
        return this.context[CONTEXT_NAME];
      }
      render() {
        return (
          <ObserverComponent {...this.props} />
        );
      }
    }
    addMobxContextToComponent(ObserverContainer, [CONTEXT_NAME]);
    addMobxContextToComponent(ObserverComponent, modelKeys);
    return ObserverContainer;
  };
}
