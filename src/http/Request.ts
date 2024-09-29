import type { Socket } from 'net';

import { IncomingMessage } from 'http';
import RequestInterface from '../types/Request';
import Exception from '../types/Exception';
import Nest from '../types/Nest';
import { ReadSession } from './Session';

export default class Request 
  extends IncomingMessage 
  implements RequestInterface 
{
  //maximum request size
  protected static _size: number = 0;

  /**
   * Set the maximum request size
   */
  public static set size(value: number) {
    this._size = value;
  }

  //data controller
  public readonly data = new Nest();
  //session controller
  public readonly session = new ReadSession(this);
  //request mimetype
  protected _type: string;
  //cached body
  protected _body?: string;

  /**
   * The raw string body of the request
   */
  public get body() {
    if (typeof this._body === 'undefined') {
      throw Exception.for('Body not loaded');
    }
    return this._body;
  }

  /**
   * Returns the parsed form data from the request body (if any)
   */
  public get form() {
    return this._type.endsWith('/json') 
      ? this._fromJson(this.body)
      : this._type.endsWith('/x-www-form-urlencoded')
      ? this._fromQuery(this.body)
      : this._type === 'multipart/form-data'
      ? this._fromFormData(this.body)
      : {} as Record<string, unknown>;
  }

  /**
   * Returns true if the body has been loaded
   */
  public get loaded() {
    return typeof this._body === 'string';
  }

  /**
   * Parsed URL query object
   */
  public get query() {
    return this._fromQuery(this.URL.searchParams.toString());
  }

  /**
   * Returns the request mimetype
   */
  public get type() {
    return this._type;
  }

  /**
   * Parsed query object
   */
  public get URL() {
    //determine protocol (by default https)
    let protocol = 'https';
    //if there is an x-forwarded-proto header
    const proto = this.headers['x-forwarded-proto'];
    if (proto?.length) {
      //then let's use that instead
      if (Array.isArray(proto)) {
        protocol = proto[0];
      } else {
        protocol = proto;
      }
      protocol = protocol.trim();
      // Note: X-Forwarded-Proto is normally only ever a
      //       single value, but this is to be safe.
      if (protocol.indexOf(',') !== -1) {
        protocol = protocol.substring(0, protocol.indexOf(',')).trim();
      }
    }
    //form the URL
    const url = `${protocol}://${this.headers.host}${this.url || '/'}`;
    //try to create a URL object
    try {
      return new URL(url);  
    } catch(e) {}
    //we need to return a URL object
    return new URL(this._unknownHost(this.url || '/'));
  }

  /**
   * Business as usual, but determines the request mimetype
   */
  constructor(socket: Socket) {
    super(socket);
    this._type = this.headers['content-type'] 
      || 'application/octet-stream';
  }

  /**
   * Loads the body
   */
  public load() {
    return new Promise<void>(resolve => {
      //if the body is cached
      if (typeof this._body !== 'undefined') {
        resolve();
      }
      //we can only request the body once
      //so we need to cache the results
      let body = '';
      this.on('data', chunk => {
        body += chunk;
        if (body.length > Request._size) {
          throw Exception.for('Request exceeds %s', Request._size);
        }
      });
      this.on('end', () => {
        this._body = body;
        this.data.set(Object.assign({},
          this.query,
          this.headers,
          this.session.data,
          this.form
        ));
        resolve();
      });
    });
  }

  /**
   * Uploads the body to a file
   */
  public upload(file: string) {
    return new Promise<void>((resolve, reject) => {
      //if the body is cached
      if (typeof this._body !== 'undefined') {
        resolve();
      }
      const fs = require('fs');
      const stream = fs.createWriteStream(file);
      this.pipe(stream);
      stream.on('close', () => {
        //because request body can only be read once
        this._body = '';
        this.data.set(Object.assign({},
          this.query,
          this.headers,
          this.session.data,
          this.form
        ));
        resolve();
      });
      stream.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * Transform query string into object
   * This is usually from URL.search or 
   * body application/x-www-form-urlencoded
   */
  protected _fromQuery(query: string) {
    if (query) {
      const nest = new Nest();
      nest.withQuery.set(query);
      return nest.get() as Record<string, unknown>;
    }
    return {} as Record<string, unknown>;
  }

  /**
   * Transform form data into object
   * This is usually from body multipart/form-data
   */
  protected _fromFormData(data: string) {
    if (data) {
      const nest = new Nest();
      nest.withFormData.set(data);
      return nest.get() as Record<string, unknown>;
    }
    return {} as Record<string, unknown>;
  }

  /**
   * Transform JSON string into object
   * This is usually from body application/json
   * or text/json
   */
  protected _fromJson(json: string) {
    if (json.startsWith('{')) {
      return JSON.parse(json) as Record<string, unknown>;
    }
    return {} as Record<string, unknown>;
  }

  /**
   * Adds a default host to invalid URLs
   */
  protected _unknownHost(url: string) {
    if (url.indexOf('/') !== 0) {
      url = '/' + url;
    }
  
    return `http://unknownhost${url}`;
  }
}