import createModel from './createModel';
export default function extendModel(parentModel, { name, constants, data = {}, actions = {} }) {
  return createModel({ name: name || parentModel.name, constants, data, actions }, parentModel);
}
