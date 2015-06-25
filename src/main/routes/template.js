
/**
 * Template processor router
 * @module
 */
var express = require('express');
var router = express.Router();

/**
 * Render and return template files
 * @param  {Request} req
 * @param  {Response} res
 */
router.get('/templates/:template', function(req, res) {
	res.render('templates/' + req.params.template);
});

module.exports = router;