export const CANCLE_KEY = new Error('CONTROL_CANCLE');

export function cancel() {
  throw CANCLE_KEY;
}
