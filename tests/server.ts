import path from 'path';
import Ingest from '../src/Ingest';

const app = new Ingest();

app.get('/', path.resolve(__dirname, 'hello'));

app.on('error', path.resolve(__dirname, 'error'))

app.createServer().listen(3000, () => {
  console.log('Server is running on port 3000');
});