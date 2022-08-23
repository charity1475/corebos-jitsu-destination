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

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

var md5$1 = {exports: {}};

/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

(function (module) {
(function ($) {

	  /**
	   * Add integers, wrapping at 2^32.
	   * This uses 16-bit operations internally to work around bugs in interpreters.
	   *
	   * @param {number} x First integer
	   * @param {number} y Second integer
	   * @returns {number} Sum
	   */
	  function safeAdd(x, y) {
	    var lsw = (x & 0xffff) + (y & 0xffff);
	    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	    return (msw << 16) | (lsw & 0xffff)
	  }

	  /**
	   * Bitwise rotate a 32-bit number to the left.
	   *
	   * @param {number} num 32-bit number
	   * @param {number} cnt Rotation count
	   * @returns {number} Rotated number
	   */
	  function bitRotateLeft(num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt))
	  }

	  /**
	   * Basic operation the algorithm uses.
	   *
	   * @param {number} q q
	   * @param {number} a a
	   * @param {number} b b
	   * @param {number} x x
	   * @param {number} s s
	   * @param {number} t t
	   * @returns {number} Result
	   */
	  function md5cmn(q, a, b, x, s, t) {
	    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
	  }
	  /**
	   * Basic operation the algorithm uses.
	   *
	   * @param {number} a a
	   * @param {number} b b
	   * @param {number} c c
	   * @param {number} d d
	   * @param {number} x x
	   * @param {number} s s
	   * @param {number} t t
	   * @returns {number} Result
	   */
	  function md5ff(a, b, c, d, x, s, t) {
	    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
	  }
	  /**
	   * Basic operation the algorithm uses.
	   *
	   * @param {number} a a
	   * @param {number} b b
	   * @param {number} c c
	   * @param {number} d d
	   * @param {number} x x
	   * @param {number} s s
	   * @param {number} t t
	   * @returns {number} Result
	   */
	  function md5gg(a, b, c, d, x, s, t) {
	    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
	  }
	  /**
	   * Basic operation the algorithm uses.
	   *
	   * @param {number} a a
	   * @param {number} b b
	   * @param {number} c c
	   * @param {number} d d
	   * @param {number} x x
	   * @param {number} s s
	   * @param {number} t t
	   * @returns {number} Result
	   */
	  function md5hh(a, b, c, d, x, s, t) {
	    return md5cmn(b ^ c ^ d, a, b, x, s, t)
	  }
	  /**
	   * Basic operation the algorithm uses.
	   *
	   * @param {number} a a
	   * @param {number} b b
	   * @param {number} c c
	   * @param {number} d d
	   * @param {number} x x
	   * @param {number} s s
	   * @param {number} t t
	   * @returns {number} Result
	   */
	  function md5ii(a, b, c, d, x, s, t) {
	    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
	  }

	  /**
	   * Calculate the MD5 of an array of little-endian words, and a bit length.
	   *
	   * @param {Array} x Array of little-endian words
	   * @param {number} len Bit length
	   * @returns {Array<number>} MD5 Array
	   */
	  function binlMD5(x, len) {
	    /* append padding */
	    x[len >> 5] |= 0x80 << len % 32;
	    x[(((len + 64) >>> 9) << 4) + 14] = len;

	    var i;
	    var olda;
	    var oldb;
	    var oldc;
	    var oldd;
	    var a = 1732584193;
	    var b = -271733879;
	    var c = -1732584194;
	    var d = 271733878;

	    for (i = 0; i < x.length; i += 16) {
	      olda = a;
	      oldb = b;
	      oldc = c;
	      oldd = d;

	      a = md5ff(a, b, c, d, x[i], 7, -680876936);
	      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
	      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
	      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
	      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
	      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
	      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
	      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
	      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
	      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
	      c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
	      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
	      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
	      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
	      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
	      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

	      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
	      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
	      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
	      b = md5gg(b, c, d, a, x[i], 20, -373897302);
	      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
	      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
	      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
	      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
	      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
	      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
	      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
	      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
	      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
	      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
	      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
	      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

	      a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
	      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
	      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
	      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
	      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
	      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
	      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
	      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
	      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
	      d = md5hh(d, a, b, c, x[i], 11, -358537222);
	      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
	      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
	      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
	      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
	      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
	      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

	      a = md5ii(a, b, c, d, x[i], 6, -198630844);
	      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
	      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
	      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
	      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
	      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
	      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
	      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
	      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
	      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
	      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
	      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
	      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
	      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
	      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
	      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

	      a = safeAdd(a, olda);
	      b = safeAdd(b, oldb);
	      c = safeAdd(c, oldc);
	      d = safeAdd(d, oldd);
	    }
	    return [a, b, c, d]
	  }

	  /**
	   * Convert an array of little-endian words to a string
	   *
	   * @param {Array<number>} input MD5 Array
	   * @returns {string} MD5 string
	   */
	  function binl2rstr(input) {
	    var i;
	    var output = '';
	    var length32 = input.length * 32;
	    for (i = 0; i < length32; i += 8) {
	      output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
	    }
	    return output
	  }

	  /**
	   * Convert a raw string to an array of little-endian words
	   * Characters >255 have their high-byte silently ignored.
	   *
	   * @param {string} input Raw input string
	   * @returns {Array<number>} Array of little-endian words
	   */
	  function rstr2binl(input) {
	    var i;
	    var output = [];
	    output[(input.length >> 2) - 1] = undefined;
	    for (i = 0; i < output.length; i += 1) {
	      output[i] = 0;
	    }
	    var length8 = input.length * 8;
	    for (i = 0; i < length8; i += 8) {
	      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
	    }
	    return output
	  }

	  /**
	   * Calculate the MD5 of a raw string
	   *
	   * @param {string} s Input string
	   * @returns {string} Raw MD5 string
	   */
	  function rstrMD5(s) {
	    return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
	  }

	  /**
	   * Calculates the HMAC-MD5 of a key and some data (raw strings)
	   *
	   * @param {string} key HMAC key
	   * @param {string} data Raw input string
	   * @returns {string} Raw MD5 string
	   */
	  function rstrHMACMD5(key, data) {
	    var i;
	    var bkey = rstr2binl(key);
	    var ipad = [];
	    var opad = [];
	    var hash;
	    ipad[15] = opad[15] = undefined;
	    if (bkey.length > 16) {
	      bkey = binlMD5(bkey, key.length * 8);
	    }
	    for (i = 0; i < 16; i += 1) {
	      ipad[i] = bkey[i] ^ 0x36363636;
	      opad[i] = bkey[i] ^ 0x5c5c5c5c;
	    }
	    hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
	    return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
	  }

	  /**
	   * Convert a raw string to a hex string
	   *
	   * @param {string} input Raw input string
	   * @returns {string} Hex encoded string
	   */
	  function rstr2hex(input) {
	    var hexTab = '0123456789abcdef';
	    var output = '';
	    var x;
	    var i;
	    for (i = 0; i < input.length; i += 1) {
	      x = input.charCodeAt(i);
	      output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
	    }
	    return output
	  }

	  /**
	   * Encode a string as UTF-8
	   *
	   * @param {string} input Input string
	   * @returns {string} UTF8 string
	   */
	  function str2rstrUTF8(input) {
	    return unescape(encodeURIComponent(input))
	  }

	  /**
	   * Encodes input string as raw MD5 string
	   *
	   * @param {string} s Input string
	   * @returns {string} Raw MD5 string
	   */
	  function rawMD5(s) {
	    return rstrMD5(str2rstrUTF8(s))
	  }
	  /**
	   * Encodes input string as Hex encoded string
	   *
	   * @param {string} s Input string
	   * @returns {string} Hex encoded string
	   */
	  function hexMD5(s) {
	    return rstr2hex(rawMD5(s))
	  }
	  /**
	   * Calculates the raw HMAC-MD5 for the given key and data
	   *
	   * @param {string} k HMAC key
	   * @param {string} d Input string
	   * @returns {string} Raw MD5 string
	   */
	  function rawHMACMD5(k, d) {
	    return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
	  }
	  /**
	   * Calculates the Hex encoded HMAC-MD5 for the given key and data
	   *
	   * @param {string} k HMAC key
	   * @param {string} d Input string
	   * @returns {string} Raw MD5 string
	   */
	  function hexHMACMD5(k, d) {
	    return rstr2hex(rawHMACMD5(k, d))
	  }

	  /**
	   * Calculates MD5 value for a given string.
	   * If a key is provided, calculates the HMAC-MD5 value.
	   * Returns a Hex encoded string unless the raw argument is given.
	   *
	   * @param {string} string Input string
	   * @param {string} [key] HMAC key
	   * @param {boolean} [raw] Raw output switch
	   * @returns {string} MD5 output
	   */
	  function md5(string, key, raw) {
	    if (!key) {
	      if (!raw) {
	        return hexMD5(string)
	      }
	      return rawMD5(string)
	    }
	    if (!raw) {
	      return hexHMACMD5(key, string)
	    }
	    return rawHMACMD5(key, string)
	  }

	  if (module.exports) {
	    module.exports = md5;
	  } else {
	    $.md5 = md5;
	  }
	})(commonjsGlobal);
} (md5$1));

var md5 = md5$1.exports;

const validator = async (config) => {
    ['instance_name', 'url', 'username', 'access_key', 'event_types', 'message_template'].forEach(prop => {
        if (config[prop] === undefined) {
            throw new Error(`Required property '${prop}' is absent in config. Present props: ${Object.keys(config)}`);
        }
    });
    try {
        let response = await fetch(`${config.url}/webservice.php/getchallenge?operation=getchallenge&username=${config.username}`, { method: 'get' });
        let response_json = await response.json();
        if (response_json.success == true) {
            //var tk = login(config);
            //return { ok: true }
            return login(config);
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
    dstContext.config;
    function getEventType($) {
        switch ($.event_type) {
            case "notification":
            case "identify":
                return "$identify";
            case "page":
            case "pageview":
            case "site_page":
                return "Page View";
            default:
                return $.event_type;
        }
    }
    const eventType = getEventType(event);
    let envelops = [];
    if (eventType == "$identify") {
        envelops.push({
            url: "https://demo.corebos.com/webservice.php/webservice.php/getchallenge?operation=getchallenge&username=admin",
            method: "GET",
            body: {}
        });
    }
    if (eventType == "Page View") {
        envelops.push({
            url: "https://demo.corebos.com/webservice.php/webservice.php/getchallenge?operation=getchallenge&username=admin",
            method: "POST",
            body: JSON.stringify([{
                    event: "$site_page",
                    properties: {}
                }
            ])
        });
    }
    return envelops;
    // return { url: `${dstContext.config.url}/webservice.php/getchallenge?operation=getchallenge&username=${dstContext.config.username}`, method: "GET", body: { a: (event.a || 0) + 1 } };
};
const login = async (config) => {
    let response = await fetch(`${config.url}/webservice.php/getchallenge?operation=getchallenge&username=${config.username}`, { method: 'get' });
    let response_json = await response.json();
    if (response_json.success == true) {
        var token = md5(response_json.result.token + config.access_key);
        var login_response = await fetch(`${config.url}/webservice.php/login?operation=login&username=${config.username}&accesskey=${token}`, { method: 'post' });
        let result = await login_response.json();
        // return result.result.sessionName;
        return result;
    }
    else {
        return null;
    }
};

const descriptor = {
    id: "corebos-jitsu-destination",
    displayName: "coreBOS",
    icon: "https://corebos.com/documentation/coreboswsapi/favicon.ico",
    description: "Jitsu can send events from JS SDK or Events API to coreBOS API",
    configurationParameters: [
        {
            id: "url",
            type: "string",
            required: true,
            displayName: "coreBOS base url",
            documentation: "<a href=\"https://corebos.com/documentation/coreboswsapi/#overview\"> refer corebos demo instance</a>",
        },
        {
            id: "event_types",
            type: "string",
            required: true,
            displayName: "events to capture",
            documentation: "comma separated list of events to capture",
        },
        {
            id: "username",
            type: "string",
            required: true,
            displayName: "corebos user usernme",
            documentation: "<a href=\"https://corebos.com/documentation/coreboswsapi/#servers\"> corebos username </a>",
        },
        {
            id: "access_key",
            type: "string",
            required: true,
            displayName: "corebos access key",
            documentation: "<a href=\"https://corebos.com/documentation/coreboswsapi/#servers\"> corebos account access key </a>",
        },
        {
            id: "instance_name",
            type: "string",
            required: true,
            displayName: "corebos instance name, e.g. corebos",
            documentation: "<a href=\"https://corebos.com/documentation/coreboswsapi/#servers\"> corebos account access key </a>",
        },
        {
            id: "message_template",
            type: "string",
            required: true,
            displayName: "message template",
            documentation: "message template",
        }
    ],
};
const __$srcLib = srcLib;

exports.__$srcLib = __$srcLib;
exports.descriptor = descriptor;
exports.destination = destination;
exports.validator = validator;

exports.buildInfo = {sdkVersion: "0.9.0", sdkPackage: "jitsu-cli", buildTimestamp: "2022-08-23T11:44:52.181Z"};
exports.streamReader$StdoutFacade = exports.streamReader && __$srcLib.stdoutStreamReader(exports.streamReader);
