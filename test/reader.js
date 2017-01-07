// reader.js
/* eslint-env mocha */
"use strict"

const should = require("should");
const SlowReader = require("../").SlowReader;

describe("SlowReader - Functions", function() {

	let testReader = null;

	it("constructor", function() {
		// Use a very small buffer
		testReader = new SlowReader("./test/test-file.txt", { bufferSize: 4 });
		should.exist(testReader);
	});

	it("should open test file", function(done) {
		testReader.open(done);
	});

	it("should read a line", function(done) {
		testReader.read(function(err, line) {
			should.not.exist(err);
			should.exist(line);
			line.should.match("test-file.txt");
			done();
		});
	});

	it("should close test file", function(done) {
		testReader.close(done);
	});

	it("should re-open the file", function(done) {
		testReader.open(done);
	});

	it("should re-read a line", function(done) {
		testReader.read(function(err, line) {
			should.not.exist(err);
			should.exist(line);
			line.should.match("test-file.txt");
			done();
		});
	});

	it("should read all remaining lines", function(done) {
		let lineCount = 0;
		testReader.readEachSeries(function(line, callback) {
			++lineCount;
			should.exist(line);
			line.should.be.a.String();
			setImmediate(callback);
		}, function(err) {
			should.not.exist(err);
			lineCount.should.equal(175);
			done();
		});
	});

	it("should re-close test file", function(done) {
		testReader.close(done);
	});

});

describe("SlowReader - Unicode", function() {
	this.timeout(60000);

	let testReader = null;

	it("constructor", function() {
		testReader = new SlowReader("./test/test-file.txt");
		should.exist(testReader);
	});

	it("should open test file", function(done) {
		testReader.open(done);
	});

	it("should read all remaining lines", function(done) {
		let lineCount = 0;
		testReader.readEachSeries(function(line, callback) {
			++lineCount;
			should.exist(line);
			line.should.be.a.String();
			setImmediate(callback);
		}, function(err) {
			should.not.exist(err);
			lineCount.should.equal(176);
			done();
		});
	});

	it("should return undefined when reading beyond end of file", function(done) {
		testReader.read(function(err, line) {
			should.not.exist(err);
			should.not.exist(line);
			done();
		});
	});

	it("should close test file", function(done) {
		testReader.close(done);
	});

});

describe("SlowReader - Delimiter", function() {
	this.timeout(60000);

	let testReader = null;

	it("constructor", function() {
		testReader = new SlowReader("./test/test-file.txt", { terminator: "#\t" });
		should.exist(testReader);
	});

	it("should open test file", function(done) {
		testReader.open(done);
	});

	it("should read all remaining lines", function(done) {
		let lineCount = 0;
		testReader.readEachSeries(function(line, callback) {
			++lineCount;
			should.exist(line);
			line.should.be.a.String();
			setImmediate(callback);
		}, function(err) {
			should.not.exist(err);
			lineCount.should.equal(33);
			done();
		});
	});

	it("should close test file", function(done) {
		testReader.close(done);
	});

});
