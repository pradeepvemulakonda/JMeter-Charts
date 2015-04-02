/**
 * Provides a facade to process xslt files in an asynchronous way
 * @fileoverview Provides a facade to process xslt files in an asynchronous way
 * @author Pradeep Vemulakonda
 * @exports XSLTProcessor
 * @module RestServer
 * @requires node_xslt
 */

var nodeXslt = require('node_xslt');
var fs = require('fs');
var xslt4node = require('xslt4node');
/**
 * Returns a XSLTProcessor which contains methods to parse xml and translate them as required.
 * @constructor
 */
XSLTProcessor = function(stylesheetFileName) {
	return {
		translate: function (filePath, callback) {
			console.log('XML ----'+filePath);
			console.log('xslt----'+stylesheetFileName);
			fs.readFile(filePath,{encoding: 'UTF-8'}, function (err, data) {
				if (err) {
					throw err;
				}
				var config = {
				    xsltPath: stylesheetFileName,
				    source: data,
				    result: String,
				    props: {
				        indent: 'yes'
				    }
				};
				console.log('Calling transform');
				xslt4node.transform(config, callback);
				// delete the file asynchronously
				fs.unlink(filePath, function (err) {
					if(err) {
						console.log(err);
					}

				});
			});

		}
	};
};

exports.XSLTProcessor = XSLTProcessor;
