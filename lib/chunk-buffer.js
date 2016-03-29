// reader.js
/* jshint node: true, esversion: 6 */
"use strict";

const fs = require("fs");
const StringDecoder = require("string_decoder").StringDecoder;

module.exports = class {
	// Create "chunk" reader for given file
	constructor(filePath, encoding, bufferSize) {
		this._filePath = filePath;
		this._decoder = new StringDecoder(encoding || "utf8");
		this._bufferSize = bufferSize || 4096;
	}

	// Open file for reading
	open(callback) {
		fs.open(this._filePath, "r", (err, fd) => {
			if (err) {
				return callback(err);
			}
			this._fd = fd;
			this.eof = false;
			// Initialise internal buffer
			this._buffer = new Buffer(this._bufferSize);
			callback();
		});
	}

	// Read and decode next "chunk" from file
	read(callback) {
		// Read file from last position
		fs.read(this._fd, this._buffer, 0, this._bufferSize, null,
		(err, bytesRead, buffer) => {
			if (err) {
				return callback(err);
			}
			// Check if file has ended
			if (bytesRead < this._bufferSize) {
				this.eof = true;
				// Remove garbage from end of buffer
				buffer = buffer.slice(0, bytesRead);
			}
			// Decode buffer (decoder retains "stray" bytes from last read)
			callback(null, this._decoder.write(buffer));
		});
	}

	// Close file
	close(callback) {
		fs.close(this._fd, callback);
		this._fd = null;
	}
};
