import type Request from './Request';
import type Response from './Response';

import Status from './StatusCode';
import TaskQueue from './TaskQueue';

/**
 * Allows the ability to listen to events made known by another
 * piece of functionality. Events are items that transpire based
 * on an action. With events you can add extra functionality
 * right after the event has triggered.
 */
export default class EventEmitter {
  /**
   * A listener map to task queues
   */
  public readonly listeners: Record<string, Task[]> = {};
 
  /**
   * Event regular expression map
   */
  protected regexp: string[] = [];

  /**
   * Returns a new task queue (defined like this so it can be overloaded)
   */
  static makeQueue() {
    return new TaskQueue();
  }

  /**
   * Calls all the callbacks of the given event passing the given arguments
   */
  async emit(event: string, req: Request, res: Response) {
    const matches = this.match(event);

    //if there are no events found
    if (!Object.keys(matches).length) {
      //report a 404
      return Status.NOT_FOUND;
    }

    const queue = EventEmitter.makeQueue();

    Object.keys(matches).forEach((key: string) => {
      const match = matches[key];
      const event = match.pattern;
      //if no direct observers
      if (typeof this.listeners[event] === 'undefined') {
        return;
      }

      //add args on to match
      match.request = req;
      match.response = res;

      //then loop the observers
      this.listeners[event].forEach(listener => {
        queue.add(listener.entry, listener.priority)
      });
    });

    //call the callbacks
    return await queue.run<EventEmitter>(req, res, this);
  }

  /**
   * Returns possible event matches
   */
  match(event: string): Record<string, Event> {
    const matches: Record<string, Event> = {};

    //first do the obvious match
    if (typeof this.listeners[event] !== 'undefined') {
      matches[event] = {
        event: event,
        pattern: event,
        parameters: []
      };
    }

    //next do the calculated matches
    this.regexp.forEach(pattern => {
      const regexp = new RegExp(
        // pattern,
        pattern.substr(
          pattern.indexOf('/') + 1,
          pattern.lastIndexOf('/') - 1
        ),
        // flag
        pattern.substr(
          pattern.lastIndexOf('/') + 1
        )
      );

      //because String.matchAll only works for global flags ...
      let match, parameters: string[];
      if (regexp.flags.indexOf('g') === -1) {
        match = event.match(regexp);
        if (!match || !match.length) {
          return;
        }

        parameters = [];
        if (Array.isArray(match)) {
          parameters = match.slice();
          parameters.shift();
        }
      } else {
        match = Array.from(event.matchAll(regexp));
        if (!Array.isArray(match[0]) || !match[0].length) {
          return;
        }

        parameters = match[0].slice();
        parameters.shift();
      }

      matches[pattern] = { event, pattern, parameters };
    })

    return matches;
  }

  /**
   * Adds a callback to the given event listener
   */
  on(event: Listenable, entry: string, priority: number = 0) {
    //deal with multiple events
    if (Array.isArray(event)) {
      event.forEach((event) => {
        this.on(event, entry, priority)
      });
      return this;
    }

    //if it is a regexp object
    if (event instanceof RegExp) {
      //make it into a string
      event = event.toString()
      //if the pattern is not registered yet
      if (this.regexp.indexOf(event) === -1) {
        //go ahead and add it
        this.regexp.push(event)
      }
    }

    //add the event to the listeners
    if (typeof this.listeners[event] === 'undefined') {
      this.listeners[event] = []
    }

    this.listeners[event].push({ priority, entry })
    return this
  }

  /**
   * Stops listening to an event
   */
  unbind(event?: string, entry?: string): EventEmitter {
    //if there is no event and not callable
    if (!event && !entry) {
        //it means that they want to remove everything
        for (let key in this.listeners) {
          delete this.listeners[key];
        }

        return this;
    }

    const listener = (this.listeners[(event as string)]);

    //if there are callbacks listening to
    //this and no callback was specified
    if (!entry && typeof listener !== 'undefined') {
        //it means that they want to remove
        //all callbacks listening to this event
        delete this.listeners[(event as string)];
        return this;
    }

    //if there are callbacks listening
    //to this and we have a callback
    if (typeof listener !== 'undefined' && typeof entry === 'string') {
      listener.forEach((task, i) => {
        if(entry === task.entry) {
          listener.splice(i, 1);
          if (!listener.length) {
            delete this.listeners[(event as string)];
          }
        }
      });
    }

    //if no event, but there is a callback
    if (!event && typeof entry === 'string') {
      Object.keys(this.listeners).forEach(event => {
        this.listeners[event].forEach((listener, i) => {
          if(entry === listener.entry) {
            this.listeners[event].splice(i, 1);
            if (!this.listeners[event].length) {
              delete this.listeners[event];
            }
          }
        });
      });
    }

    return this;
  }
}

//types
import type { Task, Queue } from './TaskQueue';
import type { StatusCode } from './StatusCode';

/**
 * Abstraction defining what an event is
 */
export interface Event {
  /**
   * The name of the event
   */
  event: string;

  /**
   * The regexp pattern of the event
   */
  pattern: string;

  /**
   * Parameters extracted from the pattern
   */
  parameters: string[];

  /**
   * `req` from the `emit()`
   */
  request?: Request;

  /**
   * `res` from the `emit()`
   */
  response?: Response;

  /**
   * The current callback of the event being emitted
   */
  callback?: Function;

  /**
   * The priority of the callback that is currently being emitted
   */
  priority?: number;
}

/**
 * Abstraction defining what an emitter is
 */
export interface Emitter {
  /**
   * A listener map to task queues
   */
  listeners: Record<string, Queue>;

  /**
   * Calls all the callbacks of the given event passing the given arguments
   */
  emit(event: string, req: Request, res: Response): Promise<StatusCode>;

  /**
   * Adds a callback to the given event listener
   */
  on(
    event: string|string[]|RegExp, 
    entry: String, 
    priority: number
  ): Emitter
}

/**
 * All things an event emitter can listen to
 */
export type Listenable = string|RegExp|(string|RegExp)[];