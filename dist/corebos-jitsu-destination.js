//format=cjs
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var require$$0 = require('crypto');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

function _mergeNamespaces(n, m) {
  m.forEach(function (e) {
    e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
      if (k !== 'default' && !(k in n)) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  });
  return Object.freeze(n);
}

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

var sourcesLib = {};

var objectHash = {exports: {}};

(function (module, exports) {

	var crypto = require$$0__default.default;

	/**
	 * Exported function
	 *
	 * Options:
	 *
	 *  - `algorithm` hash algo to be used by this instance: *'sha1', 'md5'
	 *  - `excludeValues` {true|*false} hash object keys, values ignored
	 *  - `encoding` hash encoding, supports 'buffer', '*hex', 'binary', 'base64'
	 *  - `ignoreUnknown` {true|*false} ignore unknown object types
	 *  - `replacer` optional function that replaces values before hashing
	 *  - `respectFunctionProperties` {*true|false} consider function properties when hashing
	 *  - `respectFunctionNames` {*true|false} consider 'name' property of functions for hashing
	 *  - `respectType` {*true|false} Respect special properties (prototype, constructor)
	 *    when hashing to distinguish between types
	 *  - `unorderedArrays` {true|*false} Sort all arrays before hashing
	 *  - `unorderedSets` {*true|false} Sort `Set` and `Map` instances before hashing
	 *  * = default
	 *
	 * @param {object} object value to hash
	 * @param {object} options hashing options
	 * @return {string} hash value
	 * @api public
	 */
	exports = module.exports = objectHash;

	function objectHash(object, options){
	  options = applyDefaults(object, options);

	  return hash(object, options);
	}

	/**
	 * Exported sugar methods
	 *
	 * @param {object} object value to hash
	 * @return {string} hash value
	 * @api public
	 */
	exports.sha1 = function(object){
	  return objectHash(object);
	};
	exports.keys = function(object){
	  return objectHash(object, {excludeValues: true, algorithm: 'sha1', encoding: 'hex'});
	};
	exports.MD5 = function(object){
	  return objectHash(object, {algorithm: 'md5', encoding: 'hex'});
	};
	exports.keysMD5 = function(object){
	  return objectHash(object, {algorithm: 'md5', encoding: 'hex', excludeValues: true});
	};

	// Internals
	var hashes = crypto.getHashes ? crypto.getHashes().slice() : ['sha1', 'md5'];
	hashes.push('passthrough');
	var encodings = ['buffer', 'hex', 'binary', 'base64'];

	function applyDefaults(object, sourceOptions){
	  sourceOptions = sourceOptions || {};

	  // create a copy rather than mutating
	  var options = {};
	  options.algorithm = sourceOptions.algorithm || 'sha1';
	  options.encoding = sourceOptions.encoding || 'hex';
	  options.excludeValues = sourceOptions.excludeValues ? true : false;
	  options.algorithm = options.algorithm.toLowerCase();
	  options.encoding = options.encoding.toLowerCase();
	  options.ignoreUnknown = sourceOptions.ignoreUnknown !== true ? false : true; // default to false
	  options.respectType = sourceOptions.respectType === false ? false : true; // default to true
	  options.respectFunctionNames = sourceOptions.respectFunctionNames === false ? false : true;
	  options.respectFunctionProperties = sourceOptions.respectFunctionProperties === false ? false : true;
	  options.unorderedArrays = sourceOptions.unorderedArrays !== true ? false : true; // default to false
	  options.unorderedSets = sourceOptions.unorderedSets === false ? false : true; // default to false
	  options.unorderedObjects = sourceOptions.unorderedObjects === false ? false : true; // default to true
	  options.replacer = sourceOptions.replacer || undefined;
	  options.excludeKeys = sourceOptions.excludeKeys || undefined;

	  if(typeof object === 'undefined') {
	    throw new Error('Object argument required.');
	  }

	  // if there is a case-insensitive match in the hashes list, accept it
	  // (i.e. SHA256 for sha256)
	  for (var i = 0; i < hashes.length; ++i) {
	    if (hashes[i].toLowerCase() === options.algorithm.toLowerCase()) {
	      options.algorithm = hashes[i];
	    }
	  }

	  if(hashes.indexOf(options.algorithm) === -1){
	    throw new Error('Algorithm "' + options.algorithm + '"  not supported. ' +
	      'supported values: ' + hashes.join(', '));
	  }

	  if(encodings.indexOf(options.encoding) === -1 &&
	     options.algorithm !== 'passthrough'){
	    throw new Error('Encoding "' + options.encoding + '"  not supported. ' +
	      'supported values: ' + encodings.join(', '));
	  }

	  return options;
	}

	/** Check if the given function is a native function */
	function isNativeFunction(f) {
	  if ((typeof f) !== 'function') {
	    return false;
	  }
	  var exp = /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i;
	  return exp.exec(Function.prototype.toString.call(f)) != null;
	}

	function hash(object, options) {
	  var hashingStream;

	  if (options.algorithm !== 'passthrough') {
	    hashingStream = crypto.createHash(options.algorithm);
	  } else {
	    hashingStream = new PassThrough();
	  }

	  if (typeof hashingStream.write === 'undefined') {
	    hashingStream.write = hashingStream.update;
	    hashingStream.end   = hashingStream.update;
	  }

	  var hasher = typeHasher(options, hashingStream);
	  hasher.dispatch(object);
	  if (!hashingStream.update) {
	    hashingStream.end('');
	  }

	  if (hashingStream.digest) {
	    return hashingStream.digest(options.encoding === 'buffer' ? undefined : options.encoding);
	  }

	  var buf = hashingStream.read();
	  if (options.encoding === 'buffer') {
	    return buf;
	  }

	  return buf.toString(options.encoding);
	}

	/**
	 * Expose streaming API
	 *
	 * @param {object} object  Value to serialize
	 * @param {object} options  Options, as for hash()
	 * @param {object} stream  A stream to write the serializiation to
	 * @api public
	 */
	exports.writeToStream = function(object, options, stream) {
	  if (typeof stream === 'undefined') {
	    stream = options;
	    options = {};
	  }

	  options = applyDefaults(object, options);

	  return typeHasher(options, stream).dispatch(object);
	};

	function typeHasher(options, writeTo, context){
	  context = context || [];
	  var write = function(str) {
	    if (writeTo.update) {
	      return writeTo.update(str, 'utf8');
	    } else {
	      return writeTo.write(str, 'utf8');
	    }
	  };

	  return {
	    dispatch: function(value){
	      if (options.replacer) {
	        value = options.replacer(value);
	      }

	      var type = typeof value;
	      if (value === null) {
	        type = 'null';
	      }

	      //console.log("[DEBUG] Dispatch: ", value, "->", type, " -> ", "_" + type);

	      return this['_' + type](value);
	    },
	    _object: function(object) {
	      var pattern = (/\[object (.*)\]/i);
	      var objString = Object.prototype.toString.call(object);
	      var objType = pattern.exec(objString);
	      if (!objType) { // object type did not match [object ...]
	        objType = 'unknown:[' + objString + ']';
	      } else {
	        objType = objType[1]; // take only the class name
	      }

	      objType = objType.toLowerCase();

	      var objectNumber = null;

	      if ((objectNumber = context.indexOf(object)) >= 0) {
	        return this.dispatch('[CIRCULAR:' + objectNumber + ']');
	      } else {
	        context.push(object);
	      }

	      if (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(object)) {
	        write('buffer:');
	        return write(object);
	      }

	      if(objType !== 'object' && objType !== 'function' && objType !== 'asyncfunction') {
	        if(this['_' + objType]) {
	          this['_' + objType](object);
	        } else if (options.ignoreUnknown) {
	          return write('[' + objType + ']');
	        } else {
	          throw new Error('Unknown object type "' + objType + '"');
	        }
	      }else {
	        var keys = Object.keys(object);
	        if (options.unorderedObjects) {
	          keys = keys.sort();
	        }
	        // Make sure to incorporate special properties, so
	        // Types with different prototypes will produce
	        // a different hash and objects derived from
	        // different functions (`new Foo`, `new Bar`) will
	        // produce different hashes.
	        // We never do this for native functions since some
	        // seem to break because of that.
	        if (options.respectType !== false && !isNativeFunction(object)) {
	          keys.splice(0, 0, 'prototype', '__proto__', 'constructor');
	        }

	        if (options.excludeKeys) {
	          keys = keys.filter(function(key) { return !options.excludeKeys(key); });
	        }

	        write('object:' + keys.length + ':');
	        var self = this;
	        return keys.forEach(function(key){
	          self.dispatch(key);
	          write(':');
	          if(!options.excludeValues) {
	            self.dispatch(object[key]);
	          }
	          write(',');
	        });
	      }
	    },
	    _array: function(arr, unordered){
	      unordered = typeof unordered !== 'undefined' ? unordered :
	        options.unorderedArrays !== false; // default to options.unorderedArrays

	      var self = this;
	      write('array:' + arr.length + ':');
	      if (!unordered || arr.length <= 1) {
	        return arr.forEach(function(entry) {
	          return self.dispatch(entry);
	        });
	      }

	      // the unordered case is a little more complicated:
	      // since there is no canonical ordering on objects,
	      // i.e. {a:1} < {a:2} and {a:1} > {a:2} are both false,
	      // we first serialize each entry using a PassThrough stream
	      // before sorting.
	      // also: we can’t use the same context array for all entries
	      // since the order of hashing should *not* matter. instead,
	      // we keep track of the additions to a copy of the context array
	      // and add all of them to the global context array when we’re done
	      var contextAdditions = [];
	      var entries = arr.map(function(entry) {
	        var strm = new PassThrough();
	        var localContext = context.slice(); // make copy
	        var hasher = typeHasher(options, strm, localContext);
	        hasher.dispatch(entry);
	        // take only what was added to localContext and append it to contextAdditions
	        contextAdditions = contextAdditions.concat(localContext.slice(context.length));
	        return strm.read().toString();
	      });
	      context = context.concat(contextAdditions);
	      entries.sort();
	      return this._array(entries, false);
	    },
	    _date: function(date){
	      return write('date:' + date.toJSON());
	    },
	    _symbol: function(sym){
	      return write('symbol:' + sym.toString());
	    },
	    _error: function(err){
	      return write('error:' + err.toString());
	    },
	    _boolean: function(bool){
	      return write('bool:' + bool.toString());
	    },
	    _string: function(string){
	      write('string:' + string.length + ':');
	      write(string.toString());
	    },
	    _function: function(fn){
	      write('fn:');
	      if (isNativeFunction(fn)) {
	        this.dispatch('[native]');
	      } else {
	        this.dispatch(fn.toString());
	      }

	      if (options.respectFunctionNames !== false) {
	        // Make sure we can still distinguish native functions
	        // by their name, otherwise String and Function will
	        // have the same hash
	        this.dispatch("function-name:" + String(fn.name));
	      }

	      if (options.respectFunctionProperties) {
	        this._object(fn);
	      }
	    },
	    _number: function(number){
	      return write('number:' + number.toString());
	    },
	    _xml: function(xml){
	      return write('xml:' + xml.toString());
	    },
	    _null: function() {
	      return write('Null');
	    },
	    _undefined: function() {
	      return write('Undefined');
	    },
	    _regexp: function(regex){
	      return write('regex:' + regex.toString());
	    },
	    _uint8array: function(arr){
	      write('uint8array:');
	      return this.dispatch(Array.prototype.slice.call(arr));
	    },
	    _uint8clampedarray: function(arr){
	      write('uint8clampedarray:');
	      return this.dispatch(Array.prototype.slice.call(arr));
	    },
	    _int8array: function(arr){
	      write('int8array:');
	      return this.dispatch(Array.prototype.slice.call(arr));
	    },
	    _uint16array: function(arr){
	      write('uint16array:');
	      return this.dispatch(Array.prototype.slice.call(arr));
	    },
	    _int16array: function(arr){
	      write('int16array:');
	      return this.dispatch(Array.prototype.slice.call(arr));
	    },
	    _uint32array: function(arr){
	      write('uint32array:');
	      return this.dispatch(Array.prototype.slice.call(arr));
	    },
	    _int32array: function(arr){
	      write('int32array:');
	      return this.dispatch(Array.prototype.slice.call(arr));
	    },
	    _float32array: function(arr){
	      write('float32array:');
	      return this.dispatch(Array.prototype.slice.call(arr));
	    },
	    _float64array: function(arr){
	      write('float64array:');
	      return this.dispatch(Array.prototype.slice.call(arr));
	    },
	    _arraybuffer: function(arr){
	      write('arraybuffer:');
	      return this.dispatch(new Uint8Array(arr));
	    },
	    _url: function(url) {
	      return write('url:' + url.toString());
	    },
	    _map: function(map) {
	      write('map:');
	      var arr = Array.from(map);
	      return this._array(arr, options.unorderedSets !== false);
	    },
	    _set: function(set) {
	      write('set:');
	      var arr = Array.from(set);
	      return this._array(arr, options.unorderedSets !== false);
	    },
	    _file: function(file) {
	      write('file:');
	      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
	    },
	    _blob: function() {
	      if (options.ignoreUnknown) {
	        return write('[blob]');
	      }

	      throw Error('Hashing Blob objects is currently not supported\n' +
	        '(see https://github.com/puleos/object-hash/issues/26)\n' +
	        'Use "options.replacer" or "options.ignoreUnknown"\n');
	    },
	    _domwindow: function() { return write('domwindow'); },
	    _bigint: function(number){
	      return write('bigint:' + number.toString());
	    },
	    /* Node.js standard native objects */
	    _process: function() { return write('process'); },
	    _timer: function() { return write('timer'); },
	    _pipe: function() { return write('pipe'); },
	    _tcp: function() { return write('tcp'); },
	    _udp: function() { return write('udp'); },
	    _tty: function() { return write('tty'); },
	    _statwatcher: function() { return write('statwatcher'); },
	    _securecontext: function() { return write('securecontext'); },
	    _connection: function() { return write('connection'); },
	    _zlib: function() { return write('zlib'); },
	    _context: function() { return write('context'); },
	    _nodescript: function() { return write('nodescript'); },
	    _httpparser: function() { return write('httpparser'); },
	    _dataview: function() { return write('dataview'); },
	    _signal: function() { return write('signal'); },
	    _fsevent: function() { return write('fsevent'); },
	    _tlswrap: function() { return write('tlswrap'); },
	  };
	}

	// Mini-implementation of stream.PassThrough
	// We are far from having need for the full implementation, and we can
	// make assumptions like "many writes, then only one final read"
	// and we can ignore encoding specifics
	function PassThrough() {
	  return {
	    buf: '',

	    write: function(b) {
	      this.buf += b;
	    },

	    end: function(b) {
	      this.buf += b;
	    },

	    read: function() {
	      return this.buf;
	    }
	  };
	}
} (objectHash, objectHash.exports));

Object.defineProperty(sourcesLib, "__esModule", { value: true });
var stdoutStreamReader_1 = sourcesLib.stdoutStreamReader = stateService_1 = sourcesLib.stateService = buildSignatureId_1 = sourcesLib.buildSignatureId = makeStreamSink_1 = sourcesLib.makeStreamSink = void 0;
const hash = objectHash.exports;
function makeStreamSink(msg, mode) {
    let recordsAdded = 0;
    let transactionNumber = 0;
    return {
        addRecord(record) {
            this.msg({ type: "record", message: record });
        },
        changeState(newState) {
            this.msg({ type: "state", message: newState });
        },
        log(level, message) {
            this.msg({ type: "log", message: { level: level, message: message } });
        },
        clearStream() {
            this.msg({ type: "clear_stream" });
        },
        deleteRecords(partitionTimestamp, granularity) {
            this.msg({
                type: "delete_records",
                message: {
                    partitionTimestamp: partitionTimestamp,
                    granularity: granularity,
                },
            });
        },
        newTransaction() {
            this.msg({ type: "new_transaction" });
        },
        msg(m) {
            switch (m.type) {
                case "record":
                    if (transactionNumber == 0) {
                        transactionNumber = 1;
                    }
                    recordsAdded++;
                    break;
                case "state":
                    break;
                case "log":
                    break;
                case "clear_stream":
                    if (mode == "full_sync") {
                        throw new Error('"clear_stream" message is not supported in full_sync mode');
                    }
                    if (transactionNumber > 1 || recordsAdded > 0) {
                        throw new Error('"clear_stream" message allowed only in the first transaction and before any "record" message added. Current transaction number: ' +
                            transactionNumber +
                            " Records added: " +
                            recordsAdded);
                    }
                    break;
                case "delete_records":
                    if (mode == "full_sync") {
                        throw new Error('"delete_records" message is not supported in full_sync mode');
                    }
                    if (recordsAdded > 0) {
                        throw new Error('"delete_records" message must precede any "record" message in transaction.');
                    }
                    if (transactionNumber == 0) {
                        transactionNumber = 1;
                    }
                    break;
                case "new_transaction":
                    if (mode == "full_sync") {
                        throw new Error('"new_transaction" message is not supported in full_sync mode');
                    }
                    recordsAdded = 0;
                    transactionNumber++;
                    break;
            }
            msg.msg(m);
        },
    };
}
var makeStreamSink_1 = sourcesLib.makeStreamSink = makeStreamSink;
function buildSignatureId(obj) {
    return hash(obj);
}
var buildSignatureId_1 = sourcesLib.buildSignatureId = buildSignatureId;
function stateService(state, sink) {
    const currentState = state || {};
    return {
        set(key, object) {
            currentState[key] = object;
            sink.changeState(currentState);
        },
        get(key) {
            return currentState[key];
        },
    };
}
var stateService_1 = sourcesLib.stateService = stateService;
function stdoutStreamReader(stream) {
    return async (sourceConfig, streamName, streamConfiguration, state) => {
        const sink = makeStreamSink({
            msg: (msg) => {
                process.stdout.write(`${JSON.stringify(msg)}\n`);
            },
        });
        await stream(sourceConfig, streamName, streamConfiguration, sink, { state: stateService(state, sink) });
    };
}
stdoutStreamReader_1 = sourcesLib.stdoutStreamReader = stdoutStreamReader;

var srcLib = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  get stdoutStreamReader () { return stdoutStreamReader_1; },
  get stateService () { return stateService_1; },
  get buildSignatureId () { return buildSignatureId_1; },
  get makeStreamSink () { return makeStreamSink_1; },
  default: sourcesLib
}, [sourcesLib]);

const validator = async (config) => {
    if (!config.instance_name) {
        return `Please provide a corebos instance name: ${config.instance_name}`;
    }
    if (!isValidUrl(config.url)) {
        return "Missing required parameter: url";
    }
    if (!config.event_types) {
        return "Missing required parameter: event_types";
    }
    if (!config.message_template) {
        return "Missing required parameter: message_template";
    }
    if (!config.username) {
        return "Missing required parameter: username";
    }
    if (!config.access_key) {
        return "Missing required parameter: username";
    }
    try {
        let response = await fetch(`${config.url}/webservice.php/getchallenge?operation=getchallenge&username=${config.username}`, { method: 'get' });
        let response_json = await response.json();
        if (response_json.success == true) {
            return true;
        }
        else {
            return "Error: " + response_json.string();
        }
    }
    catch (error) {
        return "Error: " + error.toString();
    }
};
const destination = (event, dstContext) => {
    return { url: "https://test.com", method: "POST", body: { a: (event.a || 0) + 1 } };
};
const isValidUrl = urlString => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$', 'i');
    return !!urlPattern.test(urlString);
};

const descriptor = {
    id: "corebos-jitsu-destination",
    displayName: "corebos-jitsu-destination",
    icon: "",
    description: "Jitsu destination - corebos-jitsu-destination (generated by 'jitsu-cli extension create')",
    configurationParameters: [
        { id: "exampleParam", type: "string", required: true, displayName: "Example param", documentation: "Documentation" }
    ],
};
const __$srcLib = srcLib;

exports.__$srcLib = __$srcLib;
exports.descriptor = descriptor;
exports.destination = destination;
exports.validator = validator;

exports.buildInfo = {sdkVersion: "0.9.0", sdkPackage: "jitsu-cli", buildTimestamp: "2022-08-18T14:25:45.554Z"};
exports.streamReader$StdoutFacade = exports.streamReader && __$srcLib.stdoutStreamReader(exports.streamReader);
