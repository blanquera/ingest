import type Request from './Request';
import type Response from './Response';
import cookie from 'cookie';

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

export class ReadSession {
  //data starting from the request cookie
  protected _data: Record<string, string>;

  /**
   * Returns the session data
   */
  public get data() {
    return Object.assign({}, this._data);
  }

  /**
   * Business as usual and set the session data
   */
  public constructor(request: Request) {
    this._data = cookie.parse(request.headers.cookie as string || '');
  }

  /**
   * Returns true if the session name is set
   */
  public has(name: string) {
    return name in this._data;
  }

  /**
   * Returns a session variable
   */
  public get(name: string) {
    return this._data[name];
  }
}

export class WriteSession extends ReadSession {
  //the response object
  protected _response: Response;

  /**
   * Business as usual and set the session data
   */
  public constructor(response: Response) {
    super(response.req);
    this._response = response;
  }

  /**
   * Sets a session variable. Also sets the cookie in the response 
   */
  public set(name: string, value: string, options: CookieOptions) {
    this._data[name] = value;
    this._response.setHeader(
      'Set-Cookie', 
      cookie.serialize(name, value, options)
    );
  }
}