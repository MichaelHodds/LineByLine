// reader.js
/* jshint node: true */
"use strict"

var fs = require("fs");

module.exports = class {
	// Create reader for given file, splitting content on a given terminator
	constructor(filePath, terminator, encoding, bufferSize) {
		this.filePath = filePath;
		this.terminator = terminator || "\n";
		this.encoding = encoding || "utf8";
		this.bufferSize = bufferSize || 4096;
	}

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

	_read(callback) {
		let self = this;
		// Read file from last position
		fs.read(self.fd, self.buffer, 0, self.bufferSize, null, function(err, bytesRead) {
			if (err) {
				return callback(err);
			}
			// Convert buffer contents to string, respecting encoding
			//// TODO return error if strBuffer will exceed a set limit?
			self.strBuffer += self.buffer.toString(self.encoding, 0, bytesRead);
			// Convert string buffer to lines
			self.lineBuffer = self.strBuffer.split(self.terminator);
			// Check if file has ended
			if (bytesRead < self.bufferSize) {
				self.eof = true;
				// Trim empty line(s)?
			} else {
				// Save incomplete last line in buffer for next read
				self.strBuffer = self.lineBuffer.pop();
			}
			return callback();
		});
	}

	close(callback) {
		fs.close(this.fd, callback);
	}
};
