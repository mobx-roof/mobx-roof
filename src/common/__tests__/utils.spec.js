import { expect } from 'chai';
import { compose } from '../utils';
describe('utils', () => {
  it('compose', async () => {
    const fn = (arg) => new Promise(resolve => setTimeout(() => resolve(arg * 2), 5));
    const result = await compose([fn, fn, fn], 2);
    expect(result).to.eql(16);
  });
  it('compose empty', async (done) => {
    const empty = () => {};
    const end = () => done();
    const result = await compose([empty, empty, end], 2);
    expect(result).to.eql(undefined);
  });
});
