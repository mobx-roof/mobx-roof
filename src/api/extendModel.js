import createModel from './createModel';
export default function extendModel(parentModel, configs = {}) {
  if (!configs.name) {
    throw new Error('[extendModel] need a name.');
  }
  return createModel(configs, parentModel);
}
