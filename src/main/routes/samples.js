/**
 * Router to process all Sample related REST calls
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

router.post('/project/:project/samples/selected', function(req, res) {
  var data = {};
  data.sample = JSON.parse(req.body.samples);
  data.project = req.body.project;

	collectionDriver.save('samples', req.body, function (err, samples) {
		if (err) {
    	  res.send(400, err);
      }
      else {
    	  res.send(201, samples);
      }
	});
});

router.get('/project/:project/samples/selected', function(req, res) {
  collectionDriver.getLatest('samples',{'project' : req.params.project}, {'created_at': -1}, function (err, samples) {
    if (err) {
      res.send(400, err);
    }
    else {
      res.send(200, samples);
    }
  });

});

module.exports = router;
