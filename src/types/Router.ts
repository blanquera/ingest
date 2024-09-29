import type Request from './Request';
import type Response from './Response';

import Route from './Route';
import EventEmitter from '../types/EventEmitter';

/**
 * Allows requests to be routed to a callback to be processed
 */
export default class Router extends EventEmitter {
  /**
   * Route for any method
   */
  public all(path: string, entry: string, priority?: number) {
    this.route(path).all(entry, priority);
    return this;
  }

  /**
   * Route for CONNECT method
   */
  public connect(path: string, entry: string, priority?: number) {
    this.route(path).connect(entry, priority);
    return this;
  }

  /**
   * Route for DELETE method
   */
  public delete(path: string, entry: string, priority?: number) {
    this.route(path).delete(entry, priority);
    return this;
  }

  /**
   * Route for HEAD method
   */
  public head(path: string, entry: string, priority?: number) {
    this.route(path).head(entry, priority);
    return this;
  }

  /**
   * Route for GET method
   */
  public get(path: string, entry: string, priority?: number) {
    this.route(path).get(entry, priority);
    return this;
  }

  /**
   * Route for OPTIONS method
   */
  public options(path: string, entry: string, priority?: number) {
    this.route(path).options(entry, priority);
    return this;
  }

  /**
   * Route for PATCH method
   */
  public patch(path: string, entry: string, priority?: number) {
    this.route(path).patch(entry, priority);
    return this;
  }

  /**
   * Route for POST method
   */
  public post(path: string, entry: string, priority?: number) {
    this.route(path).post(entry, priority);
    return this;
  }

  /**
   * Route for PUT method
   */
  public put(path: string, entry: string, priority?: number) {
    this.route(path).put(entry, priority);
    return this;
  }

  /**
   * Returns a route
   */
  public route(event: string) {
    return new Route(event, this);
  }

  /**
   * Routes to another place
   */
  public async routeTo(
    method: string, 
    path: string,
    req: Request,
    res: Response
  ) {
    const event = method.toUpperCase() + ' ' + path;
    const route = this.route(event);
    return await route.handle(req, res);
  }

  /**
   * Route for TRACE method
   */
  public trace(path: string, entry: string, priority?: number) {
    this.route(path).trace(entry, priority);
    return this;
  }
}