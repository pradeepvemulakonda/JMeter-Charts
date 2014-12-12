/**
 * Class used to create a REST APi to persist and query project reports
 */
var express = require('express'),
  Db = require('mongodb').Db,
  fs = require('fs'),
  http = require('http'),
  config = require('./config.json'),
  debug = require('util').debug,
  inspect = require('util').inspect,
  path = require('path'),
  MongoClient = require('mongodb').MongoClient,
  test = require('assert'),
  bodyParser = require('body-parser'),
  CollectionDriver = require('./collection-driver').CollectionDriver,
  collectionDriver,
  mongoClient,
  db,
  mongoUrl = 'mongodb://'+config.mongoHost+':'+config.mongoPort+'/'+config.mongoDB;

MongoClient.connect(mongoUrl, function(err, db) {
	  // Use the admin database for the operation
	  var adminDb = db.admin();
	  // List all the available databases
	  adminDb.listDatabases(function(err, dbs) {
	    test.equal(null, err);
	    test.ok(dbs.databases.length > 0);
	    collectionDriver = new CollectionDriver(db);
	  });
});

var express = require("express");
var app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

function errorHandler(err, req, res, next) {
	res.status(500);
	res.render('error', { error: err });
}

app.use(errorHandler);

app.get('/:collection', function(req, res) {
   var params = req.params;
   collectionDriver.findAll(req.params.collection, function(error, objs) {
    	  if (error) { 
    		  res.send(400, error); 
    	  }
	      else { 
	          if (req.accepts('html')) {
    	          res.render('index',{objects: objs, collection: req.params.collection});
              } else {
	          res.set('Content-Type','application/json');
                  res.send(200, objs);
              }
         }
   	});
});
	 
app.get('/:collection/:entity', function(req, res) {
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) {
          if (error) { res.send(400, error); }
          else { res.send(200, objs); }
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

app.post('/:collection', function(req, res) {
	var object = req.body,
		collection = req.params.collection;
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) {
        	  res.send(400, err); 
          } 
          else {
        	  res.send(201, docs); 
          }
     });
});

app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

//Start reading from stdin so we don't exit.
process.stdin.resume();

process.on('SIGINT', function() {
  collectionDriver.shutdown();
  process.exit(1);
});

fs.watchFile('config.json', function (curr, prev) {
  if(curr !== prev) {
	  delete require.cache('./config.json');
  }
});


