import createModel from './createModel';
export default function extendModel(parentModel, { name, constants, data = {}, actions = {} }) {
  if (!name) {
    throw new Error('[extendModel] need a name.');
  }
  return createModel({ name, constants, data, actions }, parentModel);
}
