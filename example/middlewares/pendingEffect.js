/**
 * Cancel action if action is pending
 */
const pendingActionCache = {};
import { controls } from '../../src';

const getKey = (model, action) => `${model.getID()}.${action}`;

function beforeEffect({ action, payload, model }) {
  const key = getKey(model, action);
  if (pendingActionCache[key]) {
    controls.cancel();
  }
  pendingActionCache[key] = true;
  return payload;
}

function afterEffect({ action, payload, model }) {
  const key = getKey(model, action);
  pendingActionCache[key] = false;
  return payload;
}

function errorEffect({ action, payload, model }) {
  const key = getKey(model, action);
  pendingActionCache[key] = false;
  if (payload === controls.CANCLE_KEY) {
    return null;
  }
  return payload;
}

export default function createPendingEffect(filter) {
  return {
    filter,
    before: beforeEffect,
    after: afterEffect,
    error: errorEffect,
  };
}
