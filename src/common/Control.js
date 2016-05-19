// middlware control
export default class Control {
  constructor(name) {
    this.name = name;
  }
}

export const CANCLE_KEY = new Control('CONTROL_CANCEL');
export const END_KEY = new Control('CONTROL_END');
