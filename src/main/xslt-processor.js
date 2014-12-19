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
	init.call(this);
};

/**
 * Initialized once the object is created.
 * Initialization loads the stylesheet and the input xml and sets the data as input
 * @access private
 */
function init() {
	this.stylesheet = nodeXslt.readXsltFile(this.stylesheetFileName);
}

/**
 * Method that returns the translated result
 * @param filename
 * @param callback
 */
XSLTProcessor.prototype.translate = function (xmlData, callback) {
	callback(nodeXslt.transform(this.stylesheet, nodeXslt.readXmlString(xmlData.toString()), [ ]));
};

exports.XSLTProcessor = XSLTProcessor;
