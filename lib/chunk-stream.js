// reader.js
/* jshint node: true, esversion: 6 */
"use strict";

const fs = require("fs");

module.exports = class {
	// Create "chunk" reader for given file
	constructor(filePath, encoding, bufferSize) {
		this._filePath = filePath;
		this._encoding = encoding || "utf8";
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
			// Initialise internal stream
			this._readStream = fs.createReadStream(null, {
				fd: this._fd,
				encoding: this._encoding,
				autoClose: false,
				highWaterMark: this._bufferSize
			});
			callback();
		});
	}

	// Read and decode next "chunk" from stream
	read(callback) {
		this._readStream
		.once("readable", () => {
			this._readStream.removeAllListeners("end");
			callback(null, this._readStream.read());
		})
		.once("end", () => {
			this._readStream.removeAllListeners("readable");
			this.eof = true;
			callback(null, "");
		})
		.read(0);
	}

	// Close file
	close(callback) {
		fs.close(this._fd, callback);
		this._fd = null;
	}
};
