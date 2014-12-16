/**
 * Sample file for unit tests
 * Using unit.js to test the application
 */

// load Unit.js module
var test = require('unit.js');
// just for example of tested value
var example = 'hello';
// assert that example variable is a string
test.string(example);
// or with Must.js
test.must(example).be.a.string();
// or with assert
test.assert(typeof example === 'string');

