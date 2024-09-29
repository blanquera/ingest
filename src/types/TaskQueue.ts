import type Request from './Request';
import type Response from './Response';

import Status from './StatusCode';

/**
 * A task queue linearly executes each task
 */
export default class TaskQueue implements Queue {
  /**
   * The in memory task queue
   */
  public readonly queue: Task[] = [];

  /**
   * Used when determining what is the lowest priority
   * when pushing into the queue
   */
  protected _lower: number = 0;

  /**
   * Used when determining what is the lowest priority
   * when shifting into the queue
   */
  protected _upper: number = 0;

  /**
   * The length of the queue
   */
  public get length(): number {
    return this.queue.length;
  }

  /**
   * Adds a task to the queue
   */
  add(entry: string, priority: number = 0) {
    if (priority > this._upper) {
      this._upper = priority;
    } else if (priority < this._lower) {
      this._lower = priority;
    }

    //fifo by default
    this.queue.push({ entry, priority });

    //then sort by priority
    this.queue.sort((a, b) => {
      return a.priority <= b.priority ? 1: -1;
    })

    return this;
  }

  /**
   * Adds a task to the bottom of the queue
   */
  push(entry: string) {
    return this.add(entry, this._lower - 1);
  }

  /**
   * Adds a task to the top of the queue
   */
  shift(entry: string) {
    return this.add(entry, this._upper + 1);
  }

  /**
   * Runs the tasks
   */
  async run<T>(req: Request, res: Response, ctx: T) {
    if (!this.queue.length) {
      //report a 404
      return Status.NOT_FOUND;
    }

    //first import all the tasks
    while (this.queue.length) {
      const task = this.queue.shift() as Task;
      const entry = await import(task.entry);
      const run = entry.default as TaskRunner<T>;

      if (typeof run === 'function' && await run(req, res, ctx) === false) {
        return Status.ABORT;
      }
    }

    return Status.OK;
  }
}

//types
import type { StatusCode } from './StatusCode';

/**
 * Abstraction defining what a task runner is
 */
export interface TaskRunner<T> {
  (req: Request, res: Response, ctx: T): boolean|void|Promise<boolean|void>
};

/**
 * Abstraction defining what a task is
 */
export interface Task {
  /**
   * The entry file point of the task
   */
  entry: string;

  /**
   * The priority of the task, when placed in a queue
   */
  priority: number;
}

/**
 * Abstraction defining what a queue is
 */
export interface Queue {
  /**
   * The list of tasks to be performed
   */
  queue: Task[];

  /**
   * Adds a task to the queue
   */
  add(entry: string, priority: number): this;

  /**
   * Adds a task to the bottom of the queue
   */
  push(entry: string): this;

  /**
   * Adds a task to the top of the queue
   */
  shift(entry: string): this;

  /**
   * Runs the tasks
   */
  run<T>(req: Request, res: Response, ctx: T): Promise<StatusCode>;
}