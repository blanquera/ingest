import path from 'path';
import http from '@blanquera/ingest/http';

const server = http();

server.get('/foo', path.resolve(__dirname, 'pages/bar'));
server.get('/foo', path.resolve(__dirname, 'pages/zoo'));
server.on('error', path.resolve(__dirname, 'events/error'));

export default server;