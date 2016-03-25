// reader.js
/* jshint node: true, esversion: 6 */
"use strict";

const Chunker = require("./chunk-buffer");
// const Chunker = require("./chunk-stream");

module.exports = class {
	// Create reader for given file, splitting content on a given terminator
	constructor(filePath, terminator, encoding, bufferSize) {
		this._chunker = new Chunker(filePath, encoding, bufferSize);
		this._terminator = terminator || "\n";
	}

	// Open file for reading
	open(callback) {
		this._chunker.open( (err) => {
			if (err) {
				return callback(err);
			}
			// Initialise internal buffers
			this.strBuffer = "";
			this.lineBuffer = [];
			this._read(callback);
		});
	}

	// Read a single "line"
	read(callback) {
		// Return buffered line
		if (this.lineBuffer.length) {
			return setImmediate( () => {
				// Trim any leading/trailing whitespace
				callback(null, this.lineBuffer.shift().trim());
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
			} else if (this.lineBuffer.length || !this._chunker.eof) {
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
			this.strBuffer += chunk;
			// Convert string buffer to lines
			this.lineBuffer = this.strBuffer.split(this._terminator);
			// Store incomplete last line from buffer for next read
			this.strBuffer = this._chunker.eof ? "" : this.lineBuffer.pop();
			callback();
		});
	}

	// Close file
	close(callback) {
		this._chunker.close(callback);
	}
};
