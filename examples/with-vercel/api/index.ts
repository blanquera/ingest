export function GET(request: Request) {
  console.log('request', request);
  const response = new Response('Hello, World!');
  console.log('response', response);
  return response;
}