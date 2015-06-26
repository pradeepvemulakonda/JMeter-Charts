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
  fs = require('fs'),
  http = require('http'),
  path = require('path'),
  MongoClient = require('mongodb').MongoClient,
  test = require('assert'),
  bodyParser = require('body-parser'),
  CollectionDriver = require('./util/collection-driver').CollectionDriver,
  /** @type {CollectionDriver} */
  collectionDriver,
  ChartsServer,
  app = express(),
  config,
  templateRouter = require('./routes/template.js'),
  projectRouter = require('./routes/project.js'),
  uploadRouter = require('./routes/upload.js'),
  samplesRouter = require('./routes/samples.js');

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
	var self = this;

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	}));
	app.use(express.static(path.join(__dirname, 'web/static')));
	app.set('port', process.env.PORT || config.httpPort);
	app.set('views', path.join(__dirname, 'web/views'));
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
		res.status(400);
		res.render('error', { error: err.message });
		next(err);
	}

	function logErrors(err, req, res, next) {
		console.error(err.stack);
		next(err);
	}

	// set the res local variable with collectionDriver
	app.use(function(req, res, next){
	  res.locals.collectionDriver = collectionDriver;
	  next();
	});

	app.get('/jc', function(req, res) {
		res.render('index.html', {url:req.url});
	});


	// set the template router
	app.use('/jc/', templateRouter);
	// set the project router
	app.use('/jc/', projectRouter);
	// set router for file uploads
	app.use('/jc/', uploadRouter);
	// set router for file uploads
	app.use('/jc/', samplesRouter);
	// set the log handler
	app.use(logErrors);
	// set the error handler
	app.use(errorHandler);



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
	fs.watchFile('config.json', function () {
		var data = fs.readFileSync('./config.json');
		console.log('Configuration being reloaded');
		try {
			config = JSON.parse(data);
		}
		catch (err) {
		  console.log('There has been an error parsing your JSON.');
		  console.log(err);
		}
	});

	return {
		/**
		 * Starts the chart server.
		 * This internally starts the http server and the mongodb server based on the config
		 * @access public
		 */
		start: function () {
			MongoClient.connect(self.mongoUrl, function(err, db) {
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
					console.error('Cannot start MongoDB database server');
					console.error(e);
					throw e;
				}
			});

			http.createServer(app).listen(app.get('port'), function(){
				console.log('Express server listening on port ' + app.get('port'));
			});
		},

		/**
		 * Stop a chart server. this internally stops the datastore as well
		 * @access public
		 */
		stop: function(){
			collectionDriver.shutdown();
			process.exit(1);
		}
	};
};

exports.ChartsServer = ChartsServer;
