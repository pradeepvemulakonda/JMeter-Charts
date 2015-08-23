// Copyright 2015 Pradeep Vemulakonda

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the License at

//   http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.
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

