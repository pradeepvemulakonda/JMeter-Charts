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

/**
 * Post samples selected for a project
 * @param  {Request} req
 * @param  {Response} res
 */
router.post('/project/:project/samples/selected', function(req, res) {
  var data = {};
  data.sample = req.body;
  data.project = req.params.project;

	collectionDriver.save('samples', data, function (err, samples) {
		if (err) {
    	  res.send(400, err);
      }
      else {
    	  res.send(201, samples);
      }
	});
});

/**
 * Get selected samples for a project
 * @param  {Request} req
 * @param  {Response} res
 */
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
