/**
 * Template processor router
 * @module
 */
var express = require('express');
var router = express.Router();
var collectionDriver;

// middleware specific to this router
router.use(function timeLog(req, res, next) {
  collectionDriver = res.locals.collectionDriver;
  next();
});

router.get('/project', function(req, res) {
	   var collection = 'project',
	   	   field = 'name',
	   	   query = {};

	   collectionDriver.distinct(collection, query, field, function(error, objs) {
          if (error) { res.send(400, error); }
          else { res.send(200, objs); }
       });
});

router.post('/project', function(req, res) {
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

// get the latest project
router.get('/latest', function(req, res) {
   collectionDriver.getLatest('project', {}, {'created_at': -1}, function(error, object) {
    	  if (error) {
    		  res.send(400, error);
    	  }
	      else {
	          res.set('Content-Type','application/json');
                  res.send(200, object);
          }
	 });
});

router.get('/project/:project/version/:version/latest/build', function(req, res) {
	var query =     [
                    {$match : { name : req.params.project, version: req.params.version}},
                    { $sort: {created_at: -1}},
                    { $limit: 1}
                  ];
   collectionDriver.aggregate('project', query, function(error, object) {
    	  if (error) {
    		  res.send(400, error);
    	  }
	      else {
	          res.set('Content-Type','application/json');
                  res.send(200, object);
          }
	 });
});

router.get('/project/:project/samples', function(req, res) {
   	var project = req.params.project;
   	var query = [
			        { $match : { name : project}},
              { $sort: {created_at: -1}},
			        { $project :
			            { _id: 0,
			              name: '$report.jsondata.threadgroup.name'}
			        },
			        { $limit : 1 }
			   ];
	   collectionDriver.aggregate('project', query, function(error, object) {
	    	  if (error) {
	    		  res.send(400, error);
	    	  }
		      else {
		          res.set('Content-Type','application/json');
	                  res.send(200, object);
	          }
		 });
});

router.get('/project/:name/version', function(req, res) {
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

router.get('/project/:name/version/:version/build', function(req, res) {
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

router.get('/project/:name/version/:version/build/:build', function(req, res) {
	   var params = req.params,
	   	   query = {};
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

router.get('/project/:entity', function(req, res) {
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

router.put('/:collection/:entity', function(req, res) { //A
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
       var error = { 'message' : 'Cannot PUT a whole collection' };
       res.send(400, error);
   }
});

router.delete('/:collection/:entity', function(req, res) {
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
       var error = { 'message' : 'Cannot DELETE a whole collection' };
       res.send(400, error);
   }
});

module.exports = router;