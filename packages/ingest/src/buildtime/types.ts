import type { SourceFile } from 'ts-morph';
import type Request from '../payload/Request';
import type Response from '../payload/Response';

//--------------------------------------------------------------------//
// Task Queue Types

//Abstraction defining what a task is
export type Entry = {
  //The entry file point of the task
  entry: string;
  //The priority of the task, when placed in a queue
  priority: number;
};

//Abstraction defining what a task runner is
export type TaskRunner<T> = (
  req: Request, 
  res: Response, 
  ctx: T
) => boolean|void|Promise<boolean|void>;

//--------------------------------------------------------------------//
// Event Emitter Types

/**
 * All things an event emitter can listen to
 */
export type Listenable = string|RegExp|(string|RegExp)[];

//--------------------------------------------------------------------//
// HTTP Types

export type Method = 'ALL' 
  | 'CONNECT' | 'DELETE'  | 'GET' 
  | 'HEAD'    | 'OPTIONS' | 'PATCH' 
  | 'POST'    | 'PUT'     | 'TRACE';

export type URI = { method: Method, route: string };

//--------------------------------------------------------------------//
// Filesystem Types

export type FileStat = { isFile(): boolean };

export interface FileSystem {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: BufferEncoding): string;
  realpathSync(string: string): string;
  lstatSync(path: string): FileStat;
  writeFileSync(path: string, data: string, encoding?: BufferEncoding): void;
}

//--------------------------------------------------------------------//
// Session Types

//this is a revision entry
export type Revision = {
  action: 'set'|'remove',
  value?: string|string[]
};

export type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  priority?: 'low'|'medium'|'high';
  sameSite?: boolean|'lax'|'strict'|'none';
  secure?: boolean;
};

//--------------------------------------------------------------------//
// Build Types

export type BuildType = 'function' | 'endpoint';

export type BuildInfo = {
  type: BuildType,
  method: Method,
  event: string,
  route: string,
  pattern?: RegExp,
  tasks: Set<Entry>
};

export type BuildResult = {
  id: string;
  type: BuildType;
  method: Method;
  event: string;
  route: string;
  pattern?: RegExp;
  entry: string
};

export type BuildManifest = Set<BuildInfo>;

export type ESBuildOptions = {
  minify?: boolean,
  bundle?: boolean,
  platform?: 'node'|'browser',
  globalName?: string,
  format?: 'iife'|'esm'|'cjs',
  preserveSymlinks?: boolean,
  write?: boolean,
  plugins?: {
    name: string,
    setup: Function
  }[]
};

export type BuildOptions = ESBuildOptions & {
  fs?: FileSystem,
  cwd?: string,
  buildDir?: string,
  manifestName?: string
};

export type BuilderOptions = {
  tsconfig?: string
};

export type Transpiler = (entries: string[]) => SourceFile