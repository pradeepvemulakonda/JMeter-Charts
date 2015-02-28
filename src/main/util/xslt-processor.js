/**
 * Provides a facade to process xslt files in an asynchronous way
 * @fileoverview Provides a facade to process xslt files in an asynchronous way
 * @author Pradeep Vemulakonda
 * @exports XSLTProcessor
 * @module RestServer
 * @requires node_xslt
 */

var nodeXslt = require('node_xslt'),
/**
 * Returns a XSLTProcessor which contains methods to parse xml and translate them as required.
 * @constructor
 */
XSLTProcessor = function(stylesheetFileName) {
	this.stylesheetFileName = stylesheetFileName;
	this.stylesheet = nodeXslt.readXsltFile(this.stylesheetFileName);
	return {
		translate: function (xmlData, callback) {
			try {
				callback(null, nodeXslt.transform(this.stylesheet, nodeXslt.readXmlString(xmlData.toString()), [ ]));
			} catch (error) {
				console.info(error);
				callback(error);
			}
		}
	};
};

exports.XSLTProcessor = XSLTProcessor;
