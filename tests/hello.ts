import { task } from '../src';

export default task(function hello(req, res, ctx) {
  console.log('boom boom boom')
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!');
});