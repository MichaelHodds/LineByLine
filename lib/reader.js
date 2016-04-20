// reader.js
"use strict";

const Chunker = require("./chunk-buffer");

// Add/replace properties on "original" object from the "extend" object
function objExtend(original, extend) {
	let extendKeys = Object.keys(extend);
	for (let key of extendKeys) {
		original[key] = extend[key];
	}
	return original;
}

module.exports = class {
	// Create reader for given file, splitting content on a given terminator
	constructor(filePath, options) {
		// Set default options
		let opts = objExtend({
			terminator: /\r?\n/,
			encoding: "utf8",
			bufferSize: 4096
		}, options || {});
		this._chunker = new Chunker(filePath, opts.encoding, opts.bufferSize);
		this._terminator = opts.terminator;
	}

	// Open file for reading
	open(callback) {
		this._chunker.open( (err) => {
			if (err) {
				return callback(err);
			}
			// Initialise internal buffers
			this._strBuffer = "";
			this._lineBuffer = [];
			this._read(callback);
		});
	}

	// Read a single "line"
	read(callback) {
		// Return buffered line
		if (this._lineBuffer.length) {
			return setImmediate( () => {
				// Trim any leading/trailing whitespace
				callback(null, this._lineBuffer.shift());
			});
		} else if (this._chunker.eof) {
			// No data left
			return setImmediate(callback);
		} else {
			// Read more file into buffers and try again
			this._read( (err) => {
				if (err) {
					return callback(err);
				}
				this.read(callback);
			});
		}
	}

	// Call a given function for each remaining line in the file
	// the function is given the line, and a callback to read the next line
	readEachSeries(lineCallback, endCallback) {
		// Based on async "whilst" (https://github.com/caolan/async)
		let iteratee = (callback) => {
			return this.read( (err, line) => {
				if (err) {
					return callback(err);
				}
				lineCallback(line, callback);
			});
		};
		// Handle errors and continue while there are more "lines" to process
		let next = (err) => {
			if (err) {
				return endCallback(err);
			} else if (this._lineBuffer.length || !this._chunker.eof) {
				iteratee(next);
			} else {
				endCallback();
			}
		};
		// Start iterator
		iteratee(next);
	}

	// Populate internal buffers
	_read(callback) {
		this._chunker.read( (err, chunk) => {
			if (err) {
				return callback(err);
			}
			this._strBuffer += chunk;
			// Convert string buffer to lines
			this._lineBuffer = this._strBuffer.split(this._terminator);
			// Store incomplete last line from buffer for next read
			this._strBuffer = this._chunker.eof ? "" : this._lineBuffer.pop();
			callback();
		});
	}

	// Close file
	close(callback) {
		this._chunker.close(callback);
	}
};
