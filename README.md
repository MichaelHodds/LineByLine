# Line By Line

This module contains a class for reading the content of a file in a manner similar to Node.js readLine, supporting custom delimiters and a lazy loading approach.

The class buffers a small potion of the file at any given time, and can read through massive files with a minimal memory footprint. It is best suited to cases when one intends to perform various asynchronous tasks on each line in a huge file (such as typical Extract-Transform-Load scenarios).

My primary motivation for this project was to make a class for use in a text adventure project, gradually reading throught the file at the user's pace.

#### Example Usage:

```
var LineReader = require("line-by-line");

reader = new LineReader("./file.txt");

reader.open(function(err) {
	// Can call read for as many lines as required
	reader.read(function(err, line) {
		console.log("Line: " + line);
		reader.close(function(err) {
		});
	});
});
```

#### API:

 * constructor(filePath[, terminator, encoding, bufferSize])  
 Create a file reader instance
  * filePath: path of file to be read, required.
  * terminator: string or regex to split content by, defaulted to "\n".
  * encoding: file encoding, defaulted to UTF8.
  * bufferSize: size (in bytes) to buffer from file, defaulted to 4K. Be aware that internal buffers will grow significantly larger if the file contains a lot of content without any terminators.

 * open(callback)  
 Open the file, will return Node.js fs.open errors

 * read(callback)  
 Read a "line" of content
  * callback(err, line): line will be a string of all characters read up to the terminator, stripped of any leading or trailing whitespace characters.

 * close(callback)  
 Close the file, will return Node.js fs.close errors

#### Developer Commands:

Install development modules
 * `npm install`

Run development tests
 * `npm test`
