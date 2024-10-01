import type { ServerOptions } from 'http';
import type { IM, SR } from './helpers';
import type { 
  BuildOptions, 
  BuildResult, 
  BuilderOptions 
} from '../buildtime/types';
import type TaskQueue from '../runtime/TaskQueue';

import path from 'path';
import http from 'http';
import Exception from '../Exception';
import Router from '../buildtime/Router';
import FileLoader from '../buildtime/filesystem/FileLoader';
import NodeFS from '../buildtime/filesystem/NodeFS';
import StatusCode from '../runtime/StatusCode';
import Context from '../runtime/Context';
import Request from '../payload/Request';
import Response from '../payload/Response';
import Builder from './Builder';
import { loader, dispatcher, imToURL } from './helpers';

export default class Server {
  //runtime context shareable to all endpoints
  public readonly context = new Context();
  //buildtime router
  public readonly router = new Router();
  //builder
  public readonly builder: Builder;
  //loader
  public readonly loader: FileLoader;
  //build options
  protected _build: BuildOptions;
  //build directory
  protected _endpath: string;
  //manifest path
  protected _manifest: string;

  public constructor(options: BuildOptions & BuilderOptions = {}) {
    const { 
      tsconfig, 
      fs = new NodeFS(),
      cwd = process.cwd(),
      buildDir = './.http', 
      manifestName = 'manifest.json',
      ...build 
    } = options;
    
    this.loader = new FileLoader(fs, cwd);
    this.builder = new Builder(this.router, { tsconfig });

    this._build = { ...build, fs, cwd, buildDir, manifestName };
    this._endpath = this.loader.absolute(buildDir);
    this._manifest = path.resolve(this._endpath, manifestName);

    this._route();
  }

  /**
   * Builds the entry files
   */
  public async build() {
    return await this.builder.build(this._build);
  }

  /**
   * Creates an HTTP server with the given options
   */
  public create(options: ServerOptions = {}) {
    return http.createServer(options, async (im, sr) => {
      await this.send(im, sr);
    });
  }

  /**
   * 3. Runs the 'response' event and interprets
   */
  public async dispatch(req: Request, res: Response) {
    //emit a response event
    const status = await this.context.emit('response', req, res);
    //if the status was incomplete (308)
    return status.code !== StatusCode.ABORT.code;
  }

  /**
   * Handles a payload using events
   */
  public async handle(event: string, req: Request, res: Response) {
    //try to trigger request pre-processors
    if (!await this.prepare(req, res)) {
      //if the request exits, then stop
      return false;
    }
    // from here we can assume that it is okay to
    // continue with processing the routes
    if (!await this.process(event, req, res)) {
      //if the request exits, then stop
      return false;
    }
    //last call before dispatch
    if (!await this.dispatch(req, res)) {
      //if the dispatch exits, then stop
      return false;
    }
    //anything else?
    return true;
  }

  /**
   * 1. Runs the 'request' event and interprets
   */
  public async prepare(req: Request, res: Response) {
    const status = await this.context.emit('request', req, res);
    //if the status was incomplete (308)
    return status.code !== StatusCode.ABORT.code;
  }

  /**
   * 2. Runs the route event and interprets
   */
  public async process(event: string, req: Request, res: Response) {
    const status = await this.context.emit(event, req, res);
    //if the status was incomplete (308)
    if (status.code === StatusCode.ABORT.code) {
      //the callback that set that should have already processed
      //the request and is signaling to no longer continue
      return false;
    }

    //if no body and status code
    //NOTE: it's okay if there is no body as 
    //      long as there is a status code
    //ex. like in the case of a redirect
    if (!res.body && !res.code) {
      res.code = StatusCode.NOT_FOUND.code;
      throw Exception
        .for(StatusCode.NOT_FOUND.message)
        .withCode(StatusCode.NOT_FOUND.code);
    }

    //if no status was set
    if (!res.code || !res.status) {
      //make it okay
      res.code = StatusCode.OK.code;
      res.status = StatusCode.OK.message;
    }

    //if the status was incomplete (308)
    return status.code !== StatusCode.ABORT.code;
  }

  /**
   * Handles a payload using events and sends it off
   */
  public async send(im: IM, sr: SR) {
    const req = new Request();
    req.loader = loader(im);
    const res = new Response();
    res.dispatcher = dispatcher(sr);
    const event = im.method + ' ' + imToURL(im).pathname;
    try {
      //handle the payload
      await this.handle(event, req, res);
    } catch(e) {
      const error = e as Error;
      res.code = res.code && res.code !== 200 
        ? res.code: 500;
      res.status = res.status && res.status !== 'OK' 
        ? res.status : error.message;
      //let middleware contribute after error
      await this.context.emit('error', req, res);
    }
    
    if (!res.sent) {
      //send the response
      res.dispatch();
    }
    return res;
  }

  /**
   * Binds the cached routes to the emitter
   */
  protected _route() {
    if (!this.loader.fs.existsSync(this._manifest)) {
      return this;
    }
    //get the manifest
    const contents = this.loader.fs.readFileSync(this._manifest, 'utf8');
    //parse the manifest
    const manifest = JSON.parse(contents) as BuildResult[];
    //make sure build is an array
    if (!Array.isArray(manifest)) {
      return this;
    }
    //loop through the manifest
    manifest.forEach(({ pattern, entry, event }) => {
      const regex = pattern?.toString() || '';
      const listener = pattern ? new RegExp(
        // pattern,
        regex.substring(
          regex.indexOf('/') + 1,
          regex.lastIndexOf('/')
        ),
        // flag
        regex.substring(
          regex.lastIndexOf('/') + 1
        )
      ) : event;
      //and add the routes
      this.context.on(listener, async (req, res, ctx) => {
        console.log('in', listener, entry)
        const { queue } = await import(entry) as { queue: TaskQueue };
        await queue.run(req, res, ctx);
      });
    });
    return this;
  }
}