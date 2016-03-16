// reader.js
/* jshint node: true */
"use strict"

var should = require("should");
var LineReader = require("../lib/reader");

describe("LineReader", function() {

	let testReader = null;

	it("constructor", function() {
		testReader = new LineReader("./test/test-file.txt");
		should.exist(testReader);
	});

	it("should open test file", function(done) {
		testReader.open(done);
	});

	it("should read a line", function(done) {
		testReader.read(function(err, line) {
			should.not.exist(err);
			should.exist(line);
			line.should.match("Test");
			// console.log(line);
			// console.log(testReader.lineBuffer);
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
			line.should.match("Test");
			done();
		});
	});

});

// describe("LineReader - load test", function() {

// 	let testReader = null;

// 	it("constructor", function() {
// 		testReader = new LineReader("./test/test-dictionary.txt");
// 		should.exist(testReader);
// 	});

// 	it("should open test file", function(done) {
// 		testReader.open(done);
// 	});

// 	it("should read a line", function(done) {
// 		testReader.read(function(err, line) {
// 			should.not.exist(err);
// 			should.exist(line);
// 			console.log(line);
// 			console.log(testReader.lineBuffer.length);
// 			done();
// 		});
// 	});

// });
