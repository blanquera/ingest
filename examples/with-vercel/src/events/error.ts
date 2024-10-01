import { task } from '@blanquera/ingest';

export default task(function hello(req, res, ctx) {
  console.log('error', res)
});