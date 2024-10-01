import type { ServerOptions } from 'http';
import type { BuildOptions, BuilderOptions } from '../buildtime/types';
export type { IM, SR } from './helpers';

import Builder from './Builder';
import Server from './Server';

import Nest from '../payload/Nest';
import Payload from '../payload/Payload';
import Request from '../payload/Request';
import Response from '../payload/Response';
import { ReadSession, WriteSession } from '../payload/Session'; 

import {
  formDataToObject,
  imQueryToObject,
  imToURL,
  loader,
  dispatcher
} from './helpers';

export {
  Builder,
  Server,
  Nest,
  Payload,
  Request,
  Response,
  ReadSession,
  WriteSession,
  formDataToObject,
  imQueryToObject,
  imToURL,
  loader,
  dispatcher
}

export default function http(options: BuildOptions & BuilderOptions = {}) {
  const server = new Server(options);
  return {
    server,
    context: server.context,
    router: server.router,
    builder: server.builder,
    loader: server.loader,
    build: () => server.build(),
    create: (options: ServerOptions = {}) => server.create(options),
    on: (path: string, entry: string, priority?: number) => {
      return server.router.on(path, entry, priority);
    },
    unbind: (event: string, entry: string) => {
      return server.router.unbind(event, entry);
    },
    all: (path: string, entry: string, priority?: number) => {
      return server.router.all(path, entry, priority);
    },
    connect: (path: string, entry: string, priority?: number) => {
      return server.router.connect(path, entry, priority);
    },
    delete: (path: string, entry: string, priority?: number) => {
      return server.router.delete(path, entry, priority);
    },
    get: (path: string, entry: string, priority?: number) => {
      return server.router.get(path, entry, priority);
    },
    head: (path: string, entry: string, priority?: number) => {
      return server.router.head(path, entry, priority);
    },
    options: (path: string, entry: string, priority?: number) => {
      return server.router.options(path, entry, priority);
    },
    patch: (path: string, entry: string, priority?: number) => {
      return server.router.patch(path, entry, priority);
    },
    post: (path: string, entry: string, priority?: number) => {
      return server.router.post(path, entry, priority);
    },
    put: (path: string, entry: string, priority?: number) => {
      return server.router.put(path, entry, priority);
    },
    trace: (path: string, entry: string, priority?: number) => {
      return server.router.trace(path, entry, priority);
    }
  }
}