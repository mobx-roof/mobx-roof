import createModel from './createModel';
export default function extendModel(parentModel, { name, data = {}, actions = {} }) {
  return createModel({ name: name || parentModel.name, data, actions }, parentModel);
}
