import { task } from '@blanquera/ingest';

export default task(function hello(req, res, ctx) {
  console.log('bar bar bar');
  const bar = req.data.get('bar') || 'bar';
  res.data.set({ bar });
});