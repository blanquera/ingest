import type Request from './Request';
import type Response from './Response';

import EventEmitter from '../types/EventEmitter';
import StatusCode from '../types/StatusCode';
import Exception from '../types/Exception';

/**
 * Single route handler
 */
export default class Route {
  /**
   * The event string that will be hanndled
   */
  protected event: string;

  /**
   * The router to work with
   */
  protected router: EventEmitter;
  
  /**
   * Sets the route path we are working with
   */
  public constructor(event: string, router: EventEmitter) {
    this.event = event;
    this.router = router;
  }

  /**
   * Listens for all requests matching path
   */
  public all(entry: string, priority?: number) {
    return this.on('[A-Z]+', entry, priority);
  }

  /**
   * Listens for CONNECT requests matching path
   */
  public connect(entry: string, priority?: number) {
    return this.on('CONNECT', entry, priority);
  }

  /**
   * Listens for DELETE requests matching path
   */
  public delete(entry: string, priority?: number) {
    return this.on('DELETE', entry, priority);
  }

  /**
   * 3. Runs the 'response' event and interprets
   */
  public async dispatch(req: Request, res: Response): Promise<boolean> {
    //emit a response event
    const status = await this.router.emit('response', req, res);

    //if the status was incomplete (308)
    return status.code !== StatusCode.ABORT.code;
  }

  /**
   * Listens for GET requests matching path
   */
  public get(entry: string, priority?: number) {
    return this.on('GET', entry, priority);
  }

  /**
   * Handles the route
   */
  public async handle(req: Request, res: Response) {
    //try to trigger request pre-processors
    if (!await this.prepare(req, res)) {
      //if the request exits, then stop
      return false;
    }

    // from here we can assume that it is okay to
    // continue with processing the routes
    if (!await this.process(req, res)) {
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
   * Listens for HEAD requests matching path
   */
  public head(entry: string, priority?: number) {
    return this.on('HEAD', entry, priority);
  }

  /**
   * Transform the route into an event
   */
  public on(method: string, entry: string, priority?: number) {
    //convert path to a regex pattern
    const pattern = this.event
      //replace the :variable-_name01
      .replace(/(\:[a-zA-Z0-9\-_]+)/g, '*')
      //replace the stars
      //* -> ([^/]+)
      //@ts-ignore Property 'replaceAll' does not exist on type 'string'
      //but it does exist according to MDN...
      .replaceAll('*', '([^/]+)')
      //** -> ([^/]+)([^/]+) -> (.*)
      .replaceAll('([^/]+)([^/]+)', '(.*)');

    //now form the event pattern
    const event = new RegExp(`^${method}\\s${pattern}/*$`, 'ig');
    //add to tasks
    this.router.on(event, entry, priority);
    return this;
  }

  /**
   * Listens for OPTIONS requests matching path
   */
  public options(entry: string, priority?: number) {
    return this.on('OPTIONS', entry, priority);
  }

  /**
   * Listens for PATCH requests matching path
   */
  public patch(entry: string, priority?: number) {
    return this.on('PATCH', entry, priority);
  }

  /**
   * Listens for POST requests matching path
   */
  public post(entry: string, priority?: number) {
    return this.on('POST', entry, priority);
  }

  /**
   * 1. Runs the 'request' event and interprets
   */
  public async prepare(request: Request, response: Response): Promise<boolean> {
    const status = await this.router.emit('request', request, response);

    //if the status was incomplete (308)
    return status.code !== StatusCode.ABORT.code;
  }

  /**
   * 2. Runs the route event and interprets
   */
  public async process(request: Request, response: Response): Promise<boolean> {
    const status = await this.router.emit(this.event, request, response);

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
    if (!response.body && !response.status) {
      response.code = StatusCode.NOT_FOUND.code;
      throw Exception
        .for(StatusCode.NOT_FOUND.message)
        .withCode(StatusCode.NOT_FOUND.code);
    }

    //if no status was set
    if (!response.status) {
      //make it okay
      response.code = StatusCode.OK.code;
      response.status = StatusCode.OK.message;
    }

    //if the status was incomplete (308)
    return status.code !== StatusCode.ABORT.code;
  }

  /**
   * Listens for PUT requests matching path
   */
  public put(entry: string, priority?: number) {
    return this.on('PUT', entry, priority);
  }

  /**
   * Listens for TRACE requests matching path
   */
  public trace(entry: string, priority?: number) {
    return this.on('TRACE', entry, priority);
  }
}