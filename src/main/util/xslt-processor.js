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
var log4js = require('log4js');
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('../../logs/upload.log'), 'xslt');
var logger = log4js.getLogger('xslt');
/**
 * Returns a XSLTProcessor which contains methods to parse xml and translate them as required.
 * @constructor
 */
var XSLTProcessor = function(stylesheetFileName) {
	return {
		translate: function (filePath, callback) {
			logger.debug('XML  ---->'+filePath);
			logger.debug('xslt ---->'+stylesheetFileName);
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
