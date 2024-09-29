import { task } from '../src';

export default task(function hello(req, res, ctx) {
  console.log('error', res)
});