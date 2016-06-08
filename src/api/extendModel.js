import createModel from './createModel';
export default function extendModel(parentModel, { name, constants, data, actions, autorun, privates }) {
  if (!name) {
    throw new Error('[extendModel] need a name.');
  }
  return createModel({ name, constants, data, actions, privates, autorun }, parentModel);
}
