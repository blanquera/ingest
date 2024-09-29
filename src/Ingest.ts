import type { ServerOptions } from 'http';
import http from 'http';
import Request from './http/Request';
import Response from './http/Response';
import Router from './types/Router';

export default class Ingest extends Router {
  /**
   * Creates an HTTP server with the given options
   */
  public createServer(options: ServerOptions = {}) {
    const config = { 
      ...options, 
      IncomingMessage: Request, 
      ServerResponse: Response 
    };
    return http.createServer(config, async (req, res) => {
      try {
        //let middleware contribute before routing
        await this.emit('open', req, res);
        //if it was not already sent off 
        if (!res.sent) {
          //handle the route
          const event = req.method + ' ' + req.URL.pathname;
          const route = this.route(event);
          await route.handle(req, res);
          //let middleware contribute to populating resources
          // NOTE: dispatchers should use this instead of close
          await this.emit('dispatch', req, res);
        }
        //let middleware contribute after closing
        await this.emit('close', req, res);
      } catch(e) {
        const error = e as Error;
        res.code = 500;
        res.status = error.message;
        //let middleware contribute after error
        await this.emit('error', req, res);
      }
      return res;
    });
  }

  /**
   * Redirects to another place
   */
  public redirect(path: string, res: Response): Router {
    res.code = 307;
    res.status = 'Temporary Redirect';
    res.setHeader('Location', path)
    return this;
  }
}

//this is just a silly way to infer a type from a remote file
export const task = (callback: (
  req: Request, 
  res: Response, 
  ctx: Ingest
) => void) => callback;