/**
 * Processor use to upload xml files and process them to a json file in mongodb
 * @module
 */
var express = require('express');
var router = express.Router();
var collectionDriver;
var STYLESHEET = '../../resources/report-style.xsl';
var xsltProcessor = require('../util/xslt-processor').XSLTProcessor(STYLESHEET);
var fs = require('fs');

// middleware specific to this router
router.use(function timeLog(req, res, next) {
  collectionDriver = res.locals.collectionDriver;
  next();
});

router.post('/upload', function(req, res, next) {
	var project = req.param('project'),
		version = req.param('version'),
		build = req.param('build');
	if(!(project && version && build)) {
		throw new Error('Project, version and build data should be provided');
	}
});


router.processFile = function (fileName, req, res) {
  xsltProcessor.translate(fileName, _persistantHelper(req, res, req.files.resultFiles[0].originalname, true));
}

/**
 * Helper to capture the request and response for the callback.
 * @param req current request
 * @param res current response
 * @access private
 */
function _persistantHelper(req, res, fileName, endResponse) {
	return function (err, jsondata) {
		_persistJsonData(err, jsondata, req, res, fileName, endResponse);
	};
}

/**
 * Persists passed in json data to Project collection in mongodb
 * @param jsonData Json data extracted from the uploaded result file.
 * @param req request from closure scope
 * @param resp response from closure scope
 */
function _persistJsonData(err, jsonData, req, res, fileName, endResponse) {
  console.log('Processing json data extracted from the xml file');
  if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end();
      return;
  }
	var object = {};
	object.name = req.param('project');
	object.version = req.param('version');
	object.build = req.param('build');
  try {
	   object.report = JSON.parse(jsonData);
  } catch(e) {
    console.log('error');
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end();
  }
  // start writing to response
  res.writeHead(201, { 'Content-Type': 'text/plain' });
  res.write('[');
	collectionDriver.save('project', object, function(err,docs) {
          if (err) {
        	  res.write(JSON.stringify({
        		  id: null,
        		  fileName: fileName,
        		  error: err
        	  }));
        	  if(endResponse) {
        		  res.write(']');
        		  res.end();
        	  } else {
        		  res.write(',');
        	  }
          }
          else {
        	  res.write(JSON.stringify({
        		  id: docs._id,
        		  fileName: fileName
        	  }));


        	  if(endResponse) {
        		  res.write(']');
        		  res.end();
        	  } else {
        		  res.write(',');
        	  }
          }
     });
}
module.exports = router;