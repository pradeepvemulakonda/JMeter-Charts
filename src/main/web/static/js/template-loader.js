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
 * loads the template.We can set the template location and extension in this module
 * @param  {JQuery}
 * @return {String} fetched template as a string
 */
define(['jquery'], function($) {

		/**
		 * Deafult template location
		 * @type {String}
		 */
		var location =  '/jc/templates/';
		var extension = '.html';

		return {
			// load the template by returning a promise
		 	loadAsync: function (template) {
		 		var dfd = new $.Deferred();
		 		$.get(location + template + extension, function(templatedata) {
		 			dfd.resolve(templatedata);
		 		});
		 		return dfd.promise();
		 	},

		 	// load the template
		 	load: function (template, callback) {
		 		$.get(location + template + extension, callback);
		 	}
		 };
});