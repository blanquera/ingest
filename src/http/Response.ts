
import type Request from './Request';
import type { ResponseBody, Streamable } from '../types/Response';

import { ServerResponse } from 'http';
import ResponseInterface from '../types/Response';
import Nest from '../types/Nest';
import { WriteSession } from './Session';

export default class Response 
  extends ServerResponse<Request> 
  implements ResponseInterface
{
  //data controller
  public readonly data = new Nest();
  //error controller
  public readonly errors = new Nest();
  //session controller
  public readonly session = new WriteSession(this);
  protected _body?: ResponseBody;
  //whether the response has been sent
  protected _sent = false;
  //total count of possible results
  protected _total = 0;
  //response mimetype
  protected _type = 'text/plain';

  /**
   * Returns the body of the response
   */
  public get body(): ResponseBody|undefined {
    return this._body;
  }

  /**
   * Returns the status code
   */
  public get code() {
    return this.statusCode;
  }

  /**
   * Returns true if the response has been sent
   */
  public get sent() {
    return this._sent;
  }

  /**
   * Returns the status message
   */
  public get status() {
    return this.statusMessage;
  }

  /**
   * Returns the total count of possible results
   */
  public get total() {
    return this._total;
  }

  /**
   * Returns the response mimetype
   */
  public get type() {
    return this._type;
  }

  /**
   * Sets the body of the response
   */
  public set body(value: ResponseBody) {
    this._body = value;
  }

  /**
   * Sets the status code
   */
  public set code(value: number) {
    this.statusCode = value;
  }

  /**
   * Sets the status message
   */
  public set status(value: string) {
    this.statusMessage = value;
  }

  /**
   * Sets the total count of possible results
   */
  public set total(value: number) {
    this._total = value;
  }

  /**
   * Sets the response mimetype
   */
  public set type(value: string) {
    this._type = value;
  }

  /**
   * Sends the response
   */
  public send() {
    if (this._sent) {
      return this;
    }
    const streamable = this._body as Streamable;
    //if body is a valid response
    if (typeof this._body === 'string' 
      || Buffer.isBuffer(this._body) 
      || this._body instanceof Uint8Array
    ) {
      this.end(this._body);
    //if body is a stream, pipe it
    } else if (streamable && typeof streamable.pipe === 'function') {
      streamable.pipe(this);
    //if there even is a body
    } else if (typeof this._body !== 'undefined') {
      this.end(this._body.toString());
    //by default we will send a JSON from the data
    } else {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify({
        code: this.statusCode || 200,
        status: this.statusMessage || 'OK',
        results: this.data.size > 0 ? this.data.get() : undefined,
        errors: this.errors.size > 0 ? this.errors.get() : undefined,
        total: this._total > 0 ? this._total : undefined
      }));
    }
    this._sent = true;
    return this;
  }
}