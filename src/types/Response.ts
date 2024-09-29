import type Nest from './Nest';

export type Streamable = NodeJS.ReadableStream|{ pipe: (res: Response) => void };
export type ResponseBody = string
  | Buffer | Uint8Array | Streamable 
  | Record<string, unknown> | Array<unknown>;

export default interface Response {
  /**
   * Status code
   */
  code: number;

  /**
   * Parsed data
   */
  data: Nest;

  /**
   * A list of errors
   */
  errors: Nest;

  /**
   * Status message or error message
   */
  status: string;

  /**
   * Total count of results
   */
  total: number;

  /**
   * Mimetype of body
   */
  type?: string;

  /**
   * The body of the request
   */
  body?: ResponseBody;
}