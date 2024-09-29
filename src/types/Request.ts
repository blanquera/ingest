import type Nest from './Nest';

/**
 * A request can come via HTTP/S, Websocket, Terminal
 */
export default interface Request {
  /**
   * Parsed data
   */
  data: Nest;

  /**
   * Mimetype of body
   */
  type?: string;

  /**
   * The body of the request
   */
  body?: string;
}