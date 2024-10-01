var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../packages/ingest/dist/runtime/StatusCode.js
var require_StatusCode = __commonJS({
  "../../packages/ingest/dist/runtime/StatusCode.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = {
      get ABORT() {
        return { code: 308, message: "Aborted" };
      },
      get ERROR() {
        return { code: 500, message: "Internal Error" };
      },
      get NOT_FOUND() {
        return { code: 404, message: "Not Found" };
      },
      get OK() {
        return { code: 200, message: "OK" };
      }
    };
  }
});

// ../../packages/ingest/dist/runtime/TaskQueue.js
var require_TaskQueue = __commonJS({
  "../../packages/ingest/dist/runtime/TaskQueue.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var StatusCode_1 = __importDefault(require_StatusCode());
    var TaskQueue2 = class {
      constructor() {
        this.queue = [];
        this._lower = 0;
        this._upper = 0;
      }
      get length() {
        return this.queue.length;
      }
      add(callback, priority = 0) {
        if (priority > this._upper) {
          this._upper = priority;
        } else if (priority < this._lower) {
          this._lower = priority;
        }
        this.queue.push({ callback, priority });
        this.queue.sort((a, b) => {
          return a.priority <= b.priority ? 1 : -1;
        });
        return this;
      }
      push(callback) {
        return this.add(callback, this._lower - 1);
      }
      shift(callback) {
        return this.add(callback, this._upper + 1);
      }
      run(req, res, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
          if (!this.queue.length) {
            return StatusCode_1.default.NOT_FOUND;
          }
          while (this.queue.length) {
            const task2 = this.queue.shift();
            if ((yield task2.callback(req, res, ctx)) === false) {
              return StatusCode_1.default.ABORT;
            }
          }
          return StatusCode_1.default.OK;
        });
      }
    };
    exports2.default = TaskQueue2;
  }
});

// ../../packages/ingest/dist/runtime/EventEmitter.js
var require_EventEmitter = __commonJS({
  "../../packages/ingest/dist/runtime/EventEmitter.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var StatusCode_1 = __importDefault(require_StatusCode());
    var TaskQueue_1 = __importDefault(require_TaskQueue());
    var EventEmitter = class _EventEmitter {
      constructor() {
        this.listeners = /* @__PURE__ */ new Map();
        this.regexp = /* @__PURE__ */ new Set();
      }
      static makeQueue() {
        return new TaskQueue_1.default();
      }
      emit(event, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
          const matches = this.match(event);
          if (!Object.keys(matches).length) {
            return StatusCode_1.default.NOT_FOUND;
          }
          const queue = _EventEmitter.makeQueue();
          Object.keys(matches).forEach((key) => {
            const match = matches[key];
            const event2 = match.pattern;
            if (!this.listeners.has(event2)) {
              return;
            }
            match.request = req;
            match.response = res;
            const tasks = this.listeners.get(event2);
            tasks.forEach((listener) => {
              queue.add(listener.callback, listener.priority);
            });
          });
          return yield queue.run(req, res, this);
        });
      }
      match(event) {
        const matches = {};
        if (this.listeners.has(event)) {
          matches[event] = {
            event,
            pattern: event,
            parameters: []
          };
        }
        this.regexp.forEach((pattern) => {
          const regexp = new RegExp(pattern.substring(pattern.indexOf("/") + 1, pattern.lastIndexOf("/")), pattern.substring(pattern.lastIndexOf("/") + 1));
          let match, parameters;
          if (regexp.flags.indexOf("g") === -1) {
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
        });
        return matches;
      }
      on(event, callback, priority = 0) {
        if (Array.isArray(event)) {
          event.forEach((event2) => this.on(event2, callback, priority));
          return this;
        }
        if (event instanceof RegExp) {
          event = event.toString();
          this.regexp.add(event);
        }
        if (!this.listeners.has(event)) {
          this.listeners.set(event, /* @__PURE__ */ new Set());
        }
        const tasks = this.listeners.get(event);
        tasks.add({ callback, priority });
        return this;
      }
      unbind(event, callback) {
        if (!event && !callback) {
          for (let key in this.listeners) {
            this.listeners.delete(key);
          }
        } else if (event && !callback) {
          this.listeners.delete(event);
        } else if (event && callback) {
          const tasks = this.listeners.get(event);
          if (tasks) {
            tasks.forEach((task2) => {
              if (callback === task2.callback) {
                tasks.delete(task2);
              }
            });
          }
        } else if (!event && callback) {
          for (const event2 in this.listeners) {
            const tasks = this.listeners.get(event2);
            if (tasks) {
              tasks.forEach((task2) => {
                if (callback === task2.callback) {
                  tasks.delete(task2);
                }
              });
            }
          }
        }
        return this;
      }
    };
    exports2.default = EventEmitter;
  }
});

// ../../packages/ingest/dist/Exception.js
var require_Exception = __commonJS({
  "../../packages/ingest/dist/Exception.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Exception = class extends Error {
      static for(message, ...values) {
        values.forEach(function(value) {
          message = message.replace("%s", String(value));
        });
        return new this(message);
      }
      static forErrorsFound(errors) {
        const exception = new this("Invalid Parameters");
        exception.errors = errors;
        return exception;
      }
      static require(condition, message, ...values) {
        if (!condition) {
          for (const value of values) {
            message = message.replace("%s", value);
          }
          throw new this(message);
        }
      }
      constructor(message, code = 500) {
        super();
        this.errors = {};
        this.start = 0;
        this.end = 0;
        this.message = message;
        this.name = this.constructor.name;
        this.code = code;
      }
      withCode(code) {
        this.code = code;
        return this;
      }
      withPosition(start, end) {
        this.start = start;
        this.end = end;
        return this;
      }
      toJSON() {
        return {
          error: true,
          code: this.code,
          message: this.message
        };
      }
    };
    exports2.default = Exception;
  }
});

// ../../packages/ingest/dist/payload/Nest.js
var require_Nest = __commonJS({
  "../../packages/ingest/dist/payload/Nest.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FormData = exports2.Query = exports2.Path = exports2.Args = exports2.File = void 0;
    exports2.makeArray = makeArray;
    exports2.makeObject = makeObject;
    exports2.shouldBeAnArray = shouldBeAnArray;
    var Exception_1 = __importDefault(require_Exception());
    var Nest = class {
      get data() {
        return this._data;
      }
      get size() {
        return Object.keys(this._data).length;
      }
      set data(data) {
        Exception_1.default.require((data === null || data === void 0 ? void 0 : data.constructor) === Object, "Argument 1 expected Object");
        this._data = data;
      }
      constructor(data = {}) {
        this._data = data;
        this.withArgs = new Args(this);
        this.withFormData = new FormData(this);
        this.withPath = new Path(this);
        this.withQuery = new Query(this);
      }
      clear() {
        this._data = {};
        return this;
      }
      delete(...path) {
        if (!path.length) {
          return this;
        }
        if (!this.has(...path)) {
          return this;
        }
        const last = path.pop();
        let pointer = this._data;
        path.forEach((step) => {
          pointer = pointer[step];
        });
        delete pointer[last];
        return this;
      }
      entries() {
        return Object.entries(this._data);
      }
      forEach(...path) {
        return __awaiter(this, void 0, void 0, function* () {
          const callback = path.pop();
          let list = this.get(...path);
          if (!list || Array.isArray(list) && !list.length || typeof list === "string" && !list.length || typeof list === "object" && !Object.keys(list).length) {
            return false;
          }
          for (let key in list) {
            if ((yield callback(list[key], key)) === false) {
              return false;
            }
          }
          return true;
        });
      }
      get(...path) {
        if (!path.length) {
          return this._data;
        }
        if (!this.has(...path)) {
          return void 0;
        }
        const last = path.pop();
        let pointer = this._data;
        path.forEach((step) => {
          pointer = pointer[step];
        });
        return pointer[last];
      }
      has(...path) {
        if (!path.length) {
          return false;
        }
        let found = true;
        const last = path.pop();
        let pointer = this._data;
        path.forEach((step) => {
          if (!found) {
            return;
          }
          if (typeof pointer[step] !== "object") {
            found = false;
            return;
          }
          pointer = pointer[step];
        });
        return !(!found || typeof pointer[last] === "undefined");
      }
      keys() {
        return Object.keys(this._data);
      }
      set(...path) {
        if (path.length < 1) {
          return this;
        }
        if (typeof path[0] === "object") {
          Object.keys(path[0]).forEach((key) => {
            this.set(key, path[0][key]);
          });
          return this;
        }
        const value = path.pop();
        let last = path.pop(), pointer = this._data;
        path.forEach((step, i) => {
          if (step === null || step === "") {
            path[i] = step = Object.keys(pointer).length;
          }
          if (typeof pointer[step] !== "object") {
            pointer[step] = {};
          }
          pointer = pointer[step];
        });
        if (last === null || last === "") {
          last = Object.keys(pointer).length;
        }
        pointer[last] = value;
        pointer = this._data;
        path.forEach((step) => {
          const next = pointer[step];
          if (!Array.isArray(next) && shouldBeAnArray(next)) {
            pointer[step] = makeArray(next);
          } else if (Array.isArray(next) && !shouldBeAnArray(next)) {
            pointer[step] = makeObject(next);
          }
          pointer = pointer[step];
        });
        return this;
      }
      toString(expand = true, ...path) {
        return expand ? JSON.stringify(this.get(...path), null, 2) : JSON.stringify(this.get(...path));
      }
      values() {
        return Object.values(this._data);
      }
    };
    exports2.default = Nest;
    var File = class {
      constructor(file) {
        this.data = file.data;
        this.name = file.name;
        this.type = file.type;
      }
    };
    exports2.File = File;
    var Args = class {
      constructor(hash) {
        this.hash = hash;
      }
      set(...path) {
        if (path.length < 1) {
          return this.hash;
        }
        let skip = path.pop();
        if (typeof skip !== "number") {
          path.push(skip);
          skip = 0;
        }
        let args = path.pop();
        if (typeof args === "string") {
          args = args.split(" ");
        }
        let key, index = 0, i = skip, j = args.length;
        for (; i < j; i++) {
          const arg = args[i];
          const equalPosition = arg.indexOf("=");
          if (arg.substr(0, 2) === "--") {
            if (equalPosition === -1) {
              key = arg.substr(2);
              if (i + 1 < j && args[i + 1][0] !== "-") {
                this._format(path, key, args[i + 1]);
                i++;
                continue;
              }
              this._format(path, key, true);
              continue;
            }
            this._format(path, arg.substr(2, equalPosition - 2), arg.substr(equalPosition + 1));
            continue;
          }
          if (arg.substr(0, 1) === "-") {
            if (arg.substr(2, 1) === "=") {
              this._format(path, arg.substr(1, 1), arg.substr(3));
              continue;
            }
            const chars = arg.substr(1);
            for (let k = 0; k < chars.length; k++) {
              key = chars[k];
              this._format(path, key, true);
            }
            if (i + 1 < j && args[i + 1][0] !== "-") {
              this._format(path, key, args[i + 1], true);
              i++;
            }
            continue;
          }
          if (equalPosition !== -1) {
            this._format(path, arg.substr(0, equalPosition), arg.substr(equalPosition + 1));
            continue;
          }
          if (arg.length) {
            this._format(path, index++, arg);
          }
        }
        return this.hash;
      }
      _format(path, key, value, override) {
        switch (true) {
          case typeof value !== "string":
            break;
          case value === "true":
            value = true;
            break;
          case value === "false":
            value = false;
            break;
          case (!isNaN(value) && !isNaN(parseFloat(value))):
            value = parseFloat(value);
            break;
          case (!isNaN(value) && !isNaN(parseInt(value))):
            value = parseInt(value);
            break;
        }
        if (path.length) {
          key = path.join(".") + "." + key;
        }
        key = String(key);
        const withPath = this.hash.withPath;
        if (!withPath.has(key) || override) {
          withPath.set(key, value);
          return this.hash;
        }
        const current = withPath.get(key);
        if (!Array.isArray(current)) {
          withPath.set(key, [current, value]);
          return this.hash;
        }
        current.push(value);
        withPath.set(key, current);
        return this.hash;
      }
    };
    exports2.Args = Args;
    var Path = class {
      constructor(hash) {
        this.hash = hash;
      }
      forEach(notation_1, callback_1) {
        return __awaiter(this, arguments, void 0, function* (notation, callback, separator = ".") {
          const path = notation.split(separator);
          return yield this.hash.forEach(...path, callback);
        });
      }
      get(notation, separator = ".") {
        const path = notation.split(separator);
        return this.hash.get(...path);
      }
      has(notation, separator = ".") {
        const path = notation.split(separator);
        return this.hash.has(...path);
      }
      delete(notation, separator = ".") {
        const path = notation.split(separator);
        return this.hash.delete(...path);
      }
      set(notation, value, separator = ".") {
        const path = notation.split(separator);
        return this.hash.set(...path, value);
      }
    };
    exports2.Path = Path;
    var Query = class {
      constructor(hash) {
        this.hash = hash;
      }
      set(...path) {
        if (path.length < 1) {
          return this.hash;
        }
        const query = path.pop();
        const separator = "~~" + Math.floor(Math.random() * 1e4) + "~~";
        query.split(/\&/gi).forEach((filter) => {
          const [key, value] = filter.split("=", 2);
          const keys = key.replace(/\]\[/g, separator).replace("[", separator).replace(/\[/g, "").replace(/\]/g, "").split(separator);
          keys.map((key2) => {
            const index = parseInt(key2);
            if (!isNaN(index) && key2.indexOf(".") === -1) {
              return index;
            }
            return key2;
          });
          const paths = path.concat(keys);
          if (/(^\{.*\}$)|(^\[.*\]$)/.test(value)) {
            try {
              return query.set(...paths, JSON.parse(value));
            } catch (e) {
            }
          }
          if (!isNaN(parseFloat(value))) {
            this.hash.set(...paths, parseFloat(value));
          } else if (value === "true") {
            this.hash.set(...paths, true);
          } else if (value === "false") {
            this.hash.set(...paths, false);
          } else if (value === "null") {
            this.hash.set(...paths, null);
          } else {
            this.hash.set(...paths, value);
          }
        });
        return this.hash;
      }
    };
    exports2.Query = Query;
    var FormData = class {
      constructor(hash) {
        this.hash = hash;
      }
      set(...path) {
        if (path.length < 1) {
          return this.hash;
        }
        const formData = path.pop();
        const formDataBuffer = typeof formData === "string" ? Buffer.from(formData) : formData;
        const boundary = this._getBoundary(formDataBuffer);
        if (!boundary) {
          throw Exception_1.default.for("Invalid form data");
        }
        let part = [];
        for (let i = 0; i < formDataBuffer.length; i++) {
          const line = this._getLine(formDataBuffer, i);
          if (line === null) {
            break;
          }
          const buffer = line.buffer;
          if (buffer.toString().indexOf(boundary) === 0) {
            if (part.length) {
              this._setPart(path, this._getPart(part));
            }
            if (buffer.toString() === `${boundary}--`) {
              break;
            }
            part = [];
          } else {
            part.push(buffer);
          }
          i = line.i;
        }
        return this.hash;
      }
      _getBoundary(buffer) {
        var _a;
        const boundary = (_a = this._getLine(buffer, 0)) === null || _a === void 0 ? void 0 : _a.buffer;
        if (!boundary) {
          return null;
        }
        return boundary.slice(0, boundary.length - 1).toString();
      }
      _getLine(buffer, i) {
        const line = [];
        for (; i < buffer.length; i++) {
          const current = buffer[i];
          line.push(current);
          if (current === 10 || current === 13) {
            return { i, buffer: Buffer.from(line) };
          }
        }
        if (line.length) {
          return { i, buffer: Buffer.from(line) };
        }
        return null;
      }
      _getPart(lines) {
        var _a;
        const headerLines = [];
        do {
          headerLines.push((_a = lines.shift()) === null || _a === void 0 ? void 0 : _a.toString());
        } while (lines.length && !(lines[0].length === 1 && (lines[0][0] === 10 || lines[0][0] === 13)));
        const last = lines[lines.length - 1];
        lines[lines.length - 1] = last.slice(0, last.length - 1);
        const body = Buffer.concat(lines.slice(1));
        const headers = {};
        for (const line of headerLines) {
          if (line && line.indexOf(":") !== -1) {
            const [key, value] = line.toString().split(":", 2);
            headers[key.trim().toLowerCase()] = value.trim();
          }
        }
        const form = {};
        if (typeof headers["content-disposition"] === "string") {
          headers["content-disposition"].split(";").forEach((disposition) => {
            const matches = disposition.trim().match(/^([a-zA-Z0-9_\-]+)=["']([^"']+)["']$/);
            if (matches && matches.length > 2) {
              form[matches[1]] = matches[2];
            }
          });
        }
        return { headers, body, form };
      }
      _setPart(path, part) {
        if (!part.form.name) {
          return this;
        }
        const separator = "~~" + Math.floor(Math.random() * 1e4) + "~~";
        const keys = part.form.name.replace(/\]\[/g, separator).replace("[", separator).replace(/\[/g, "").replace(/\]/g, "").split(separator);
        keys.map((key) => {
          const index = parseInt(key);
          if (!isNaN(index) && key.indexOf(".") === -1) {
            return index;
          }
          return key;
        });
        const paths = path.concat(keys);
        if (!part.form.filename) {
          const value = part.body.toString();
          if (/(^\{.*\}$)|(^\[.*\]$)/.test(value)) {
            try {
              return this.hash.set(...paths, JSON.parse(value));
            } catch (e) {
            }
          }
          if (!isNaN(parseFloat(value))) {
            this.hash.set(...paths, parseFloat(value));
          } else if (value === "true") {
            this.hash.set(...paths, true);
          } else if (value === "false") {
            this.hash.set(...paths, false);
          } else if (value === "null") {
            this.hash.set(...paths, null);
          } else {
            this.hash.set(...paths, value);
          }
          return this;
        }
        this.hash.set(...paths, new File({
          data: part.body,
          name: part.form.filename,
          type: part.headers["content-type"]
        }));
      }
    };
    exports2.FormData = FormData;
    function makeArray(object) {
      const array = [];
      const keys = Object.keys(object);
      keys.sort();
      keys.forEach(function(key) {
        array.push(object[key]);
      });
      return array;
    }
    function makeObject(array) {
      return Object.assign({}, array);
    }
    function shouldBeAnArray(object) {
      if (typeof object !== "object") {
        return false;
      }
      const length = Object.keys(object).length;
      if (!length) {
        return false;
      }
      for (let i = 0; i < length; i++) {
        if (typeof object[i] === "undefined") {
          return false;
        }
      }
      return true;
    }
  }
});

// ../../packages/ingest/dist/payload/Payload.js
var require_Payload = __commonJS({
  "../../packages/ingest/dist/payload/Payload.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Nest_1 = __importDefault(require_Nest());
    var Payload = class {
      constructor() {
        this._data = new Nest_1.default();
        this._headers = /* @__PURE__ */ new Map();
        this._type = "plain/text";
      }
      get body() {
        return typeof this._body !== "undefined" ? this._body : null;
      }
      get data() {
        return this._data;
      }
      get headers() {
        return this._headers;
      }
      get type() {
        return this._type;
      }
      set body(value) {
        this._body = value;
      }
      set type(value) {
        this._type = value;
      }
    };
    exports2.default = Payload;
  }
});

// ../../packages/ingest/dist/payload/Session.js
var require_Session = __commonJS({
  "../../packages/ingest/dist/payload/Session.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WriteSession = exports2.ReadSession = void 0;
    var ReadSession = class extends Map {
      get data() {
        return Object.fromEntries(this);
      }
    };
    exports2.ReadSession = ReadSession;
    var WriteSession = class extends ReadSession {
      constructor() {
        super(...arguments);
        this.revisions = /* @__PURE__ */ new Map();
      }
      clear() {
        for (const name of this.keys()) {
          this.revisions.set(name, { action: "remove" });
        }
        super.clear();
      }
      delete(name) {
        this.revisions.set(name, { action: "remove" });
        return super.delete(name);
      }
      set(name, value) {
        this.revisions.set(name, { action: "set", value });
        return super.set(name, value);
      }
    };
    exports2.WriteSession = WriteSession;
  }
});

// ../../packages/ingest/dist/payload/Request.js
var require_Request = __commonJS({
  "../../packages/ingest/dist/payload/Request.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Payload_1 = __importDefault(require_Payload());
    var Session_1 = require_Session();
    var Request = class extends Payload_1.default {
      constructor() {
        super(...arguments);
        this._loaded = false;
        this._session = new Session_1.ReadSession();
      }
      get loaded() {
        return this._loaded;
      }
      get session() {
        return this._session;
      }
      set loader(loader) {
        this._loader = loader;
      }
      load() {
        return __awaiter(this, void 0, void 0, function* () {
          if (this._loaded) {
            return this;
          }
          if (typeof this._loader === "function") {
            yield this._loader(this);
          }
          this._loaded = true;
          return this;
        });
      }
    };
    exports2.default = Request;
  }
});

// ../../packages/ingest/dist/payload/Response.js
var require_Response = __commonJS({
  "../../packages/ingest/dist/payload/Response.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Payload_1 = __importDefault(require_Payload());
    var Nest_1 = __importDefault(require_Nest());
    var Session_1 = require_Session();
    var Response = class extends Payload_1.default {
      constructor() {
        super(...arguments);
        this._code = 0;
        this._errors = new Nest_1.default();
        this._session = new Session_1.WriteSession();
        this._sent = false;
        this._status = "";
        this._total = 0;
      }
      get code() {
        return this._code;
      }
      get errors() {
        return this._errors;
      }
      get sent() {
        return this._sent;
      }
      get session() {
        return this._session;
      }
      get status() {
        return this._status;
      }
      get total() {
        return this._total;
      }
      set code(code) {
        this._code = code;
      }
      set dispatcher(dispatcher) {
        this._dispatcher = dispatcher;
      }
      set status(status) {
        this._status = status;
      }
      set total(total) {
        this._total = total;
      }
      dispatch() {
        return __awaiter(this, void 0, void 0, function* () {
          if (this._sent) {
            return this;
          }
          if (typeof this._dispatcher === "function") {
            yield this._dispatcher(this);
          }
          this._sent = true;
          return this;
        });
      }
    };
    exports2.default = Response;
  }
});

// ../../packages/ingest/dist/runtime/helpers.js
var require_helpers = __commonJS({
  "../../packages/ingest/dist/runtime/helpers.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isHash = isHash;
    exports2.objectFromQuery = objectFromQuery;
    exports2.objectFromFormData = objectFromFormData;
    exports2.objectFromJson = objectFromJson;
    exports2.withUnknownHost = withUnknownHost;
    var Nest_1 = __importDefault(require_Nest());
    function isHash(value) {
      return typeof value === "object" && (value === null || value === void 0 ? void 0 : value.constructor.name) === "Object";
    }
    function objectFromQuery(query) {
      if (query) {
        const nest = new Nest_1.default();
        nest.withQuery.set(query);
        return nest.get();
      }
      return {};
    }
    function objectFromFormData(data) {
      if (data) {
        const nest = new Nest_1.default();
        nest.withFormData.set(data);
        return nest.get();
      }
      return {};
    }
    function objectFromJson(json) {
      if (json.startsWith("{")) {
        return JSON.parse(json);
      }
      return {};
    }
    function withUnknownHost(url) {
      if (url.indexOf("/") !== 0) {
        url = "/" + url;
      }
      return `http://unknownhost${url}`;
    }
  }
});

// ../../packages/ingest/dist/runtime/Context.js
var require_Context = __commonJS({
  "../../packages/ingest/dist/runtime/Context.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var EventEmitter_1 = __importDefault(require_EventEmitter());
    var Request_1 = __importDefault(require_Request());
    var Response_1 = __importDefault(require_Response());
    var helpers_1 = require_helpers();
    var Context = class extends EventEmitter_1.default {
      call(event, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = (0, helpers_1.isHash)(req) ? req : {};
          const request = typeof req === "undefined" || (0, helpers_1.isHash)(req) ? new Request_1.default() : req;
          request.data.set(data);
          const response = res || new Response_1.default();
          yield this.emit(event, request, response);
          return response === null || response === void 0 ? void 0 : response.data.get();
        });
      }
    };
    exports2.default = Context;
  }
});

// ../../node_modules/cookie/index.js
var require_cookie = __commonJS({
  "../../node_modules/cookie/index.js"(exports2) {
    "use strict";
    exports2.parse = parse;
    exports2.serialize = serialize;
    var __toString = Object.prototype.toString;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse(str, options) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options || {};
      var dec = opt.decode || decode;
      var index = 0;
      while (index < str.length) {
        var eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) {
          break;
        }
        var endIdx = str.indexOf(";", index);
        if (endIdx === -1) {
          endIdx = str.length;
        } else if (endIdx < eqIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        var key = str.slice(index, eqIdx).trim();
        if (void 0 === obj[key]) {
          var val = str.slice(eqIdx + 1, endIdx).trim();
          if (val.charCodeAt(0) === 34) {
            val = val.slice(1, -1);
          }
          obj[key] = tryDecode(val, dec);
        }
        index = endIdx + 1;
      }
      return obj;
    }
    function serialize(name, val, options) {
      var opt = options || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (null != opt.maxAge) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.partitioned) {
        str += "; Partitioned";
      }
      if (opt.priority) {
        var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError("option priority is invalid");
        }
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function decode(str) {
      return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
    }
    function encode(val) {
      return encodeURIComponent(val);
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]" || val instanceof Date;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// ../../packages/ingest-vercel/dist/helpers.js
var require_helpers2 = __commonJS({
  "../../packages/ingest-vercel/dist/helpers.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NativeResponse = exports2.NativeRequest = void 0;
    exports2.formDataToObject = formDataToObject;
    exports2.fetchToURL = fetchToURL;
    exports2.fetchQueryToObject = fetchQueryToObject;
    exports2.loader = loader;
    exports2.response = response;
    var cookie_1 = __importDefault(require_cookie());
    var helpers_1 = require_helpers();
    exports2.NativeRequest = global.Request;
    exports2.NativeResponse = global.Response;
    function formDataToObject(type, body) {
      return type.endsWith("/json") ? (0, helpers_1.objectFromJson)(body) : type.endsWith("/x-www-form-urlencoded") ? (0, helpers_1.objectFromQuery)(body) : type === "multipart/form-data" ? (0, helpers_1.objectFromFormData)(body) : {};
    }
    function fetchToURL(resource) {
      return new URL(resource.url);
    }
    function fetchQueryToObject(resource) {
      return (0, helpers_1.objectFromQuery)(fetchToURL(resource).searchParams.toString());
    }
    function loader(resource) {
      return (req) => {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
          if (req.body !== null) {
            resolve();
          }
          const { headers } = resource;
          req.type = headers.get("content-type") || "text/plain";
          headers.forEach((value, key) => {
            if (typeof value !== "undefined") {
              req.headers.set(key, value);
            }
          });
          const session = cookie_1.default.parse(headers.get("cookie") || "");
          Object.entries(session).forEach(([key, value]) => {
            req.session.set(key, value);
          });
          req.body = yield resource.text();
          req.data.set(Object.assign({}, fetchQueryToObject(resource), Object.fromEntries(req.headers.entries()), req.session.data, formDataToObject(req.type, req.body)));
          resolve();
        }));
      };
    }
    function response(res_1) {
      return __awaiter(this, arguments, void 0, function* (res, options = {}) {
        let type = res.type;
        let body = null;
        if (typeof res.body === "string" || Buffer.isBuffer(res.body) || res.body instanceof Uint8Array) {
          body = res.body;
        } else if (typeof res.body !== "undefined" && res.body !== null) {
          body = res.body.toString();
        } else {
          type = "application/json";
          body = JSON.stringify({
            code: res.code,
            status: res.status,
            results: res.data.size > 0 ? res.data.get() : void 0,
            errors: res.errors.size > 0 ? res.errors.get() : void 0,
            total: res.total > 0 ? res.total : void 0
          });
        }
        const response2 = new exports2.NativeResponse(body, {
          status: res.code,
          statusText: res.status
        });
        for (const [name, entry] of res.session.revisions.entries()) {
          if (entry.action === "remove") {
            response2.headers.set("Set-Cookie", cookie_1.default.serialize(name, "", Object.assign(Object.assign({}, options), { expires: /* @__PURE__ */ new Date(0) })));
          } else if (entry.action === "set" && typeof entry.value !== "undefined") {
            const { value } = entry;
            const values = Array.isArray(value) ? value : [value];
            for (const value2 of values) {
              response2.headers.set("Set-Cookie", cookie_1.default.serialize(name, value2, options));
            }
          }
        }
        for (const [name, value] of res.headers) {
          const values = Array.isArray(value) ? value : [value];
          for (const value2 of values) {
            response2.headers.set(name, value2);
          }
        }
        response2.headers.set("Content-Type", type);
        return response2;
      });
    }
  }
});

// ../../packages/ingest-vercel/dist/Server.js
var require_Server = __commonJS({
  "../../packages/ingest-vercel/dist/Server.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var StatusCode_1 = __importDefault(require_StatusCode());
    var Context_1 = __importDefault(require_Context());
    var Request_1 = __importDefault(require_Request());
    var Response_1 = __importDefault(require_Response());
    var Exception_1 = __importDefault(require_Exception());
    var helpers_1 = require_helpers2();
    var Server2 = class {
      constructor() {
        this.context = new Context_1.default();
      }
      dispatch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
          const status = yield this.context.emit("response", req, res);
          return status.code !== StatusCode_1.default.ABORT.code;
        });
      }
      emit(queue, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
          if (!(yield this.prepare(req, res))) {
            return false;
          }
          if (!(yield this.process(queue, req, res))) {
            return false;
          }
          if (!(yield this.dispatch(req, res))) {
            return false;
          }
          return true;
        });
      }
      handle(request, queue) {
        return __awaiter(this, void 0, void 0, function* () {
          const { req, res } = yield this.initialize(request);
          try {
            yield req.load();
            yield this.emit(queue, req, res);
          } catch (e) {
            const error = e;
            res.code = res.code && res.code !== 200 ? res.code : 500;
            res.status = res.status && res.status !== "OK" ? res.status : error.message;
            yield this.context.emit("error", req, res);
          }
          return (0, helpers_1.response)(res);
        });
      }
      initialize(request) {
        return __awaiter(this, void 0, void 0, function* () {
          const req = new Request_1.default();
          req.loader = (0, helpers_1.loader)(request);
          const res = new Response_1.default();
          return { req, res };
        });
      }
      prepare(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
          const status = yield this.context.emit("request", req, res);
          return status.code !== StatusCode_1.default.ABORT.code;
        });
      }
      process(queue, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
          const status = yield queue.run(req, res, this.context);
          if (status.code === StatusCode_1.default.ABORT.code) {
            return false;
          }
          if (!res.body && !res.code) {
            res.code = StatusCode_1.default.NOT_FOUND.code;
            throw Exception_1.default.for(StatusCode_1.default.NOT_FOUND.message).withCode(StatusCode_1.default.NOT_FOUND.code);
          }
          if (!res.code || !res.status) {
            res.code = StatusCode_1.default.OK.code;
            res.status = StatusCode_1.default.OK.message;
          }
          return status.code !== StatusCode_1.default.ABORT.code;
        });
      }
    };
    exports2.default = Server2;
  }
});

// ../../packages/ingest/dist/index.js
var require_dist = __commonJS({
  "../../packages/ingest/dist/index.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.withUnknownHost = exports2.objectFromJson = exports2.objectFromFormData = exports2.objectFromQuery = exports2.isHash = exports2.Exception = exports2.Context = exports2.EventEmitter = exports2.TaskQueue = exports2.Status = exports2.WriteSession = exports2.ReadSession = exports2.Response = exports2.Request = exports2.Payload = exports2.Nest = void 0;
    exports2.task = task2;
    var Nest_1 = __importDefault(require_Nest());
    exports2.Nest = Nest_1.default;
    var Payload_1 = __importDefault(require_Payload());
    exports2.Payload = Payload_1.default;
    var Request_1 = __importDefault(require_Request());
    exports2.Request = Request_1.default;
    var Response_1 = __importDefault(require_Response());
    exports2.Response = Response_1.default;
    var Session_1 = require_Session();
    Object.defineProperty(exports2, "ReadSession", { enumerable: true, get: function() {
      return Session_1.ReadSession;
    } });
    Object.defineProperty(exports2, "WriteSession", { enumerable: true, get: function() {
      return Session_1.WriteSession;
    } });
    var StatusCode_1 = __importDefault(require_StatusCode());
    exports2.Status = StatusCode_1.default;
    var TaskQueue_1 = __importDefault(require_TaskQueue());
    exports2.TaskQueue = TaskQueue_1.default;
    var EventEmitter_1 = __importDefault(require_EventEmitter());
    exports2.EventEmitter = EventEmitter_1.default;
    var Context_1 = __importDefault(require_Context());
    exports2.Context = Context_1.default;
    var Exception_1 = __importDefault(require_Exception());
    exports2.Exception = Exception_1.default;
    var helpers_1 = require_helpers();
    Object.defineProperty(exports2, "isHash", { enumerable: true, get: function() {
      return helpers_1.isHash;
    } });
    Object.defineProperty(exports2, "objectFromQuery", { enumerable: true, get: function() {
      return helpers_1.objectFromQuery;
    } });
    Object.defineProperty(exports2, "objectFromFormData", { enumerable: true, get: function() {
      return helpers_1.objectFromFormData;
    } });
    Object.defineProperty(exports2, "objectFromJson", { enumerable: true, get: function() {
      return helpers_1.objectFromJson;
    } });
    Object.defineProperty(exports2, "withUnknownHost", { enumerable: true, get: function() {
      return helpers_1.withUnknownHost;
    } });
    function task2(runner) {
      return runner;
    }
  }
});

// ../../packages/ingest/index.js
var require_ingest = __commonJS({
  "../../packages/ingest/index.js"(exports2, module2) {
    module2.exports = { ...require_dist() };
  }
});

// ingest-plugin:/Users/cblanquera/server/projects/blanquera/ingest/examples/with-vercel/api/d29d0a3865562283abe1.ts
var d29d0a3865562283abe1_exports = {};
__export(d29d0a3865562283abe1_exports, {
  ALL: () => ALL
});
module.exports = __toCommonJS(d29d0a3865562283abe1_exports);
var import_Server = __toESM(require_Server());
var import_TaskQueue = __toESM(require_TaskQueue());

// src/events/error.ts
var import_ingest = __toESM(require_ingest());
var error_default = (0, import_ingest.task)(function hello(req, res, ctx) {
  console.log("error", res);
});

// ingest-plugin:/Users/cblanquera/server/projects/blanquera/ingest/examples/with-vercel/api/d29d0a3865562283abe1.ts
function ALL(request) {
  const server = new import_Server.default();
  const queue = new import_TaskQueue.default();
  queue.add(error_default);
  return server.handle(request, queue);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ALL
});
/*! Bundled license information:

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
