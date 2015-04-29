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