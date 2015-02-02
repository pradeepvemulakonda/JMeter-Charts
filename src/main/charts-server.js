/**
 * @fileoverview Class used to create a REST APi to persist and query project reports
 * @author Pradeep Vemulakonda
 * @exports ChartsServer
 * @module RestServer
 * @requires mongodb server setup
 * @requires express server setup
 * @requires body-parser to parse json request body
 * @requires connect-busboy to load jtl files from the client
 * @version 0.1
 */

var express = require('express'),
  Db = require('mongodb').Db,
  Busboy = require('connect-busboy'),
  fs = require('fs'),
  multer  = require('multer'),
  http = require('http'),
  debug = require('util').debug,
  inspect = require('util').inspect,
  path = require('path'),
  MongoClient = require('mongodb').MongoClient,
  test = require('assert'),
  bodyParser = require('body-parser'),
  CollectionDriver = require('./collection-driver').CollectionDriver,
  XSLTProcessor = require('./xslt-processor').XSLTProcessor,
  /** @type {CollectionDriver} */
  collectionDriver,
  mongoClient,
  STYLESHEET = "../../resources/report-style.xsl",
  db,
  ChartsServer,
  app = express(),
  config,
  xsltProcessor = new XSLTProcessor(STYLESHEET);

/**
 * Chart server class used to create a chart server
 * @example
 * 		var ChartsServer = require('./charts-server.js').ChartsServer,
 *		server = new ChartsServer();
 *		server.start();
 *
 * @constructor
 * @class
 */
ChartsServer = function(conf) {
	// use the passed in config elese read from the config.js
	config = conf || require('./config.json');
	this.mongoUrl = 'mongodb://'+config.mongoHost+':'+config.mongoPort+'/'+config.mongoDB;
	_initialize();
};

/**
 * Initializes the app and setup the routers for rest server
 * @access private
 */
function _initialize() {
	app.use(multer({
		dest: '../../resources/',
		inMemory: true
	}));
	app.use(bodyParser.json());
	app.use(express.static(path.join(__dirname, 'web/views/static')));
	app.set('port', process.env.PORT || config.httpPort);
	app.set('views', path.join(__dirname, 'web/views/dynamic'));
	app.engine('html', require('ejs').renderFile);
	app.set('view engine', 'html');

	/**
	 * Error handles used to handle system exceptions
	 *
	 * @param err the error
	 * @param req the request
	 * @param res the response
	 * @param next next used to route the request to a view
	 */
	function errorHandler(err, req, res, next) {
		res.status(500);
		res.render('error', { error: err });
	}

	app.use(errorHandler);

	app.get('/jc/project/:name/version', function(req, res) {
	   var params = req.params,
	   	   query = {},
	   	   field;
		   query.name = params.name;
		   field = 'version';

	   collectionDriver.distinct('project', query, field, function(error, objs) {
	    	  if (error) {
	    		  res.send(400, error);
	    	  }
		      else {
		          res.set('Content-Type','application/json');
	                  res.send(200, objs);
	         }
	   	});
	});

	app.get('/jc/project/:name/version/:version/build', function(req, res) {
		   var params = req.params,
		   	   query = {},
		   	   field;

		   query.version = params.version;
		   query.name = params.name;

		   field = 'build';

		   collectionDriver.distinct('project', query, field, function(error, objs) {
		    	  if (error) {
		    		  res.send(400, error);
		    	  }
			      else {
			          res.set('Content-Type','application/json');
		                  res.send(200, objs);
		         }
		   	});
		});

	app.get('/jc/project/:name/version/:version/build/:build', function(req, res) {
		   var params = req.params,
		   	   query = {},
		   	   fields = null;
		   query.build = params.build;
		   query.name = params.name;
		   query.version = params.version;

		   collectionDriver.findData('project', query, function(error, objs) {
		    	  if (error) {
		    		  res.send(400, error);
		    	  }
			      else {
			          res.set('Content-Type','application/json');
		                  res.send(200, objs);
		          }
		   	});
	});

	app.get('/jc/project/:entity', function(req, res) {
	   var params = req.params;
	   var entity = params.entity;
	   var collection = 'project';
	   if (entity) {
	       collectionDriver.get(collection, entity, function(error, objs) {
	          if (error) { res.send(400, error); }
	          else { res.send(200, objs); }
	       });
	   } else {
	      res.send(400, {error: 'bad url', url: req.url});
	   }
	});

	app.get('/jc', function(req, res) {
		res.render('dashboard/index.html', {url:req.url});
	});

	app.get('/jc/templates/:template', function(req, res) {
		res.render('dashboard/' + req.params.template);
	});

	app.get('/jc/project', function(req, res) {
	   var collection = 'project',
	   	   field = 'name',
	   	   query = {};

	   collectionDriver.distinct(collection, query, field, function(error, objs) {
          if (error) { res.send(400, error); }
          else { res.send(200, objs); }
       });
	});


	app.post('/jc/project', function(req, res) {
		var object = req.body,
			collection = 'project';
	    collectionDriver.save(collection, object, function(err,docs) {
	          if (err) {
	        	  res.send(400, err);
	          }
	          else {
	        	  res.send(201, docs);
	          }
	     });
	});

	app.post('/jc/upload', function(req, res) {
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
				console.info("Multiple files sent");
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

	app.put('/:collection/:entity', function(req, res) { //A
	    var params = req.params;
	    var entity = params.entity;
	    var collection = params.collection;
	    if (entity) {
	       collectionDriver.update(collection, req.body, entity, function(error, objs) { //B
	          if (error) {
	        	  res.send(400, error);
	          }
	          else { res.send(200, objs); } //C
	       });
	   } else {
	       var error = { "message" : "Cannot PUT a whole collection" };
	       res.send(400, error);
	   }
	});

	app.delete('/:collection/:entity', function(req, res) {
	    var params = req.params;
	    var entity = params.entity;
	    var collection = params.collection;
	    if (entity) {
	       collectionDriver.delete(collection, entity, function(error, objs) { //B
	          if (error) {
	        	  res.send(400, error);
	          }
	          else { res.send(200, objs); } //C 200 b/c includes the original doc
	       });
	   } else {
	       var error = { "message" : "Cannot DELETE a whole collection" };
	       res.send(400, error);
	   }
	});

	/**
	 * Default method that is called if no other route handled the request.
	 */
	app.use(function (req,res) {
	    res.send(404, 'resource not found');
	});

	//Start reading from stdin so we don't exit.
	process.stdin.resume();

	process.on('SIGINT', function() {
	  collectionDriver.shutdown();
	  process.exit(1);
	});

	/**
	 * listen for changes in the config and update the config object.
	 * The mongodb config will be updated only at initial app,load time.
	 *
	 */
	fs.watchFile('config.json', function (curr, prev) {
		var data = fs.readFileSync('./config.json'),
		    myObj;
		console.log("Configuration being reloaded");
		try {
			config = JSON.parse(data);
		}
		catch (err) {
		  console.log('There has been an error parsing your JSON.');
		  console.log(err);
		}
	});
}

/**
 * Starts the chart server.
 * This internally starts the http server and the mongodb server based on the config
 * @access public
 */
ChartsServer.prototype.start = function () {
	MongoClient.connect(this.mongoUrl, function(err, db) {
		try{
		  // Use the admin database for the operation
		  var adminDb = db.admin();
		  // List all the available databases
		  adminDb.listDatabases(function(err, dbs) {
		    test.equal(null, err);
		    test.ok(dbs.databases.length > 0);
		    collectionDriver = new CollectionDriver(db);
		  });
		} catch(e) {
			console.error("Cannot start MongoDB database server");
			console.error(e);
			throw e;
		}
	});

	http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});
};

/**
 * Stop a chart server. this internally stops the datastore as well
 * @access public
 */
ChartsServer.prototype.stop = function(){
	collectionDriver.shutdown();
	process.exit(1);
};

exports.ChartsServer = ChartsServer;
