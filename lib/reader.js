// reader.js
/* jshint node: true, esversion: 6 */
"use strict";

const fs = require("fs");
const StringDecoder = require("string_decoder").StringDecoder;

module.exports = class {
	// Create reader for given file, splitting content on a given terminator
	constructor(filePath, terminator, encoding, bufferSize) {
		this.filePath = filePath;
		this.terminator = terminator || "\n";
		this.encoding = encoding || "utf8";
		this.decoder = new StringDecoder(this.encoding);
		this.bufferSize = bufferSize || 4096;
	}

	// Open file for reading
	open(callback) {
		let self = this;
		fs.open(this.filePath, "r", function(err, fd) {
			if (err) {
				return callback(err);
			}
			// Set file handle and end flag
			self.fd = fd;
			self.eof = false;
			// Initialise internal buffers
			self.buffer = new Buffer(self.bufferSize);
			self.strBuffer = "";
			self.lineBuffer = [];
			self._read(callback);
		});
	}

	// Read a single "line" from file
	read(callback) {
		let self = this;
		// Return buffered line
		if (self.lineBuffer.length) {
			return setImmediate(function() {
				// Trim any leading/trailing whitespace
				callback(null, self.lineBuffer.shift().trim());
			});
		} else if (self.eof) {
			// No data left
			return setImmediate(callback);
		} else {
			// Read more file into buffers and try again
			self._read(function(err) {
				if (err) {
					return callback(err);
				}
				self.read(callback);
			});
		}
	}

	// Call a given function for each remaining line in the file
	// the function is given the line, and a callback to read the next line
	readEachSeries(lineCallback, endCallback) {
		let self = this;
		// Based on async "whilst" (https://github.com/caolan/async)
		let iteratee = function(callback) {
			return self.read(function(err, line) {
				if (err) {
					return callback(err);
				}
				lineCallback(line, callback);
			});
		};
		// Handle errors and continue while there are more "lines" to process
		let next = function(err) {
			if (err) {
				return endCallback(err);
			} else if (self.lineBuffer.length || !self.eof) {
				iteratee(next);
			} else {
				endCallback();
			}
		};
		// Start iterator
		iteratee(next);
	}

	// Internal buffer populate and decode handler
	_read(callback) {
		let self = this;
		// Read file from last position
		fs.read(self.fd, self.buffer, 0, self.bufferSize, null,
		function(err, bytesRead, buffer) {
			if (err) {
				return callback(err);
			}
			// Check if file has ended
			if (bytesRead < self.bufferSize) {
				self.eof = true;
				// Slice garbage from end of buffer
				buffer = buffer.slice(0, bytesRead);
			}
			// Decode buffer (decoder retains "stray" bytes from last read)
			self.strBuffer += self.decoder.write(buffer);
			// Convert string buffer to lines
			self.lineBuffer = self.strBuffer.split(self.terminator);
			// Store incomplete last line from buffer for next read
			self.strBuffer = self.eof ? "" : self.lineBuffer.pop();
			callback();
		});
	}

	// Close open file
	close(callback) {
		fs.close(this.fd, callback);
		this.fd = null;
	}
};
