/**
 * Class used to create a REST APi to persist and query project reports
 */
var express = require('express'),
  Db = require('mongodb').Db,
  Server = require('mongodb').Server,
  Connection = require('mongodb').Connection,  
  http = require('http'),
  debug = require('util').debug,
  inspect = require('util').inspect;
  
var host = 'localhost';
var port = Connection.DEFAULT_PORT;
var db = new Db('JMeterReportDB', new Server(host, port, {}), {native_parser:false});

var ObjectID = db.bson_serializer.ObjectID;

var app = express.createServer(
  express.cookieParser(),
  express.bodyParser(),
  express.session({ secret: 'keyboard cat' })
);

app.use(express.methodOverride());
app.set('view engine', 'jade');
app.set('view options', {layout: false});

app.get('/', function(req, res){
  db.collection('project', function(err, collection) {

    // Fetch all docs for rendering of list
    collection.find({}).toArray(function(err, items) {            
      res.render('./index.jade', {locals: {project:items}});
    });          
  });
});

db.open(function(err, db) {
  if(err) {
	  throw err;    
  }
  
  //  !!! CHANGE
  db.ensureIndex("project", {loc:"2d"}, function(err, result) {
    if(err) {
    	throw err;    
    }
    app.listen(8124);
  });
});


// Create method
app.post('/report', function(req, res) {
  reportProcessor(req.body.address, {description:req.body.description}, function(err, object) {
    db.collection('project', function(err, collection) {
      
      // Insert doc
      collection.insert(object, {safe:true}, function(err, result) {
      
        // Fetch all docs for rendering of list
        collection.find({}).toArray(function(err, items) {            
          res.render('./index.jade', {locals: {project:items}});
        });        
      });        
    });
  });
});

// Update method
app.put('/report', function(req, res) {
  var id = ObjectID.createFromHexString(req.body.id);
  db.collection('project', function(err, collection) {

    collection.findOne({_id:id}, function(err, object) {
      object.description = req.body.description;
      object.address = req.body.address;

      reportProcessor(req.body.address, object, function(err, object) {
        
        collection.update({_id:object._id}, object, {safe:true}, function(err, numberOfUpdatedObjects) {

          // Fetch all docs for rendering of list
          collection.find({}).toArray(function(err, items) {            
            res.render('./index.jade', {locals: {project:items}});
          });       
        });
      });
    });
  });
});

// Delete method
app.del('/report', function(req, res) {
  var id = ObjectID.createFromHexString(req.body.id);
  db.collection('project', function(err, collection) {

    collection.remove({_id:id}, {safe:true}, function(err, numberOfDeletedRecords) {

      // Fetch all docs for rendering of list
      collection.find({}).toArray(function(err, items) {            
        res.render('./index.jade', {locals: {project:items}});
      });      
    });    
  });
});

// Get method
app.get('/report', function(req, res) {
  var id = ObjectID.createFromHexString(req.body.id);
  db.collection('project', function(err, collection) {

    collection.findOne({_id:id}, function(err, item) {

      // Fetch all docs for rendering of list
      collection.find({}).toArray(function(err, items) {            
        res.render('./index.jade', {locals: {project:items, report:item}});
      });            
    });
  });
});