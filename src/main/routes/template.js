
/**
 * Template processor router
 * @module
 */
var express = require('express');
var router = express.Router();

// middleware specific to this router
router.use(function timeLog(req, res, next) {
  next();
});

/**
 * gets the mustache html files
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {	res.render('dashboard/' + req.params.template);} [description]
 * @return {[type]}      [description]
 */
router.get('/templates/:template', function(req, res) {
	res.render('templates/' + req.params.template);
});

module.exports = router;