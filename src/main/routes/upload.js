/**
 * Route use to upload xml files and process them to a json file in mongodb
 * @module
 */
var express = require('express');
var router = express.Router();
var collectionDriver;
var STYLESHEET = '../../resources/report-style.xsl';
var xsltProcessor = require('../util/xslt-processor').XSLTProcessor(STYLESHEET);
var multer = require('multer');
var log4js = require('log4js');
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('../../logs/upload.log'), 'upload');
var logger = log4js.getLogger('upload');
// middleware specific to this router
router.use(function timeLog(req, res, next) {
    collectionDriver = res.locals.collectionDriver;
    next();
});

/**
 * Persists passed in json data to Project collection in mongodb
 * @param jsonData Json data extracted from the uploaded result file.
 * @param req request from closure scope
 * @param resp response from closure scope
 */
function _persistJsonData(err, jsonData, req, res, fileName, next) {
    console.log('Processing json data extracted from the xml file');
    if (err) {
      logger.debug(err);
      return next(new Error("The passed in file is not a valid XML/jtl file"));
    }
    // catch any errors and hand it over to express for error handling
    try {
        // create the object to persist in mongo
        var object = {};
        object.name = req.param('project');
        object.version = req.param('version');
        object.build = req.param('build');
        object.report = JSON.parse(jsonData);

        // start writing to response
        collectionDriver.save('project', object, function(err, docs) {
            if (err) {
                return next(err);
            } else {
                res.writeHead(201, {
                    'Content-Type': 'text/plain'
                });
                res.write(JSON.stringify({
                    id: docs._id,
                    fileName: fileName
                }));
                res.end();
            }
        });
    } catch (e) {
        logger.debug(e);
        return next(new Error("Error while parsing passed in results file.Results file is not a valid JMeter jtl/xml file"));
    }
}

/**
 * Helper to capture the request and response for the callback.
 * @param req current request
 * @param res current response
 * @access private
 */
function _persistantHelper(req, res, fileName, next) {
    return function(err, jsondata) {
        _persistJsonData(err, jsondata, req, res, fileName, next);
    };
}

router.post('/upload', [multer({
    dest: '../../file_directory/',
    putSingleFilesInArray: true,
    inMemory: false,
    onFileUploadComplete: function(file, req, res) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
        req.query.filePath = file.path;
    }
}), function(req, res, next) {
    var project = req.param('project'),
        version = req.param('version'),
        build = req.param('build');
    if (!(project && version && build)) {
        next(new Error('Project, version and build data should be provided'));
    }
    try {
        router.processFile(req.query.filePath, req, res, next);
    } catch (e) {
        logger.debug(e);
        next(e);
    }
}]);

/**
 * Processes one file at a time
 * @param  {String} fileName the name of the uploaded file
 * @param  {Request} req the request object
 * @param  {Response} res the response object
 * @param {Function} next used for routing
 */
router.processFile = function(fileName, req, res, next) {
    xsltProcessor.translate(fileName, _persistantHelper(req, res, req.files.resultFiles[0].originalname, next));
};
module.exports = router;
