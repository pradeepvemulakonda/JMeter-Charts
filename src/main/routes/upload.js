/**
 * Template processor router
 * @module
 */
var express = require('express');
var router = express.Router();
var collectionDriver;
var STYLESHEET = '../../resources/report-style.xsl';
var xsltProcessor = require('../util/xslt-processor').XSLTProcessor(STYLESHEET);

// middleware specific to this router
router.use(function timeLog(req, res, next) {
  collectionDriver = res.locals.collectionDriver;
  next();
});

router.post('/upload', function(req, res) {
	var arrayLength,
		project = req.param('project'),
		version = req.param('version'),
		build = req.param('build');
	if(!(project && version && build)) {
		throw new Error('Project, version and build data should be provided');
	}
	if(req.files) {
		res.writeHead(201, { 'Content-Type': 'text/plain' });
		res.write('[');
		if(req.files.resultFiles instanceof Array) {
			console.info('Multiple files sent');
			arrayLength = req.files.resultFiles.length;
			// process each of the files and persist the same in mongodb table
			for(var i = 0;i < arrayLength; i++) {
				xsltProcessor.translate(req.files.resultFiles[i].buffer, _persistantHelper(req, res, req.files.resultFiles[i].originalname, i === arrayLength - 1));
			}
		} else {
			xsltProcessor.translate(req.files.resultFiles.buffer, _persistantHelper(req, res, req.files.resultFiles.originalname, true));
		}
	} else {
		res.end(400, { 'Content-Type': 'text/plain' });
	}
});

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
	console.info(jsonData);
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
  	  return;
	}

	var object = {};
	object.name = req.param('project');
	object.version = req.param('version');
	object.build = req.param('build');
	object.report = JSON.parse(jsonData);
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