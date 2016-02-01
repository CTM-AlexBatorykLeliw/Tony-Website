var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var Asset = mongoose.model('Assets');

/* GET all media (images and videos) */
router.get('/media', function(req, res, next, assetType){
	Asset.find({ section: 'media'}, function(err, assets){
		if(err)
			return next(err);

		res.json(assets);
	});
});

/* GET all articles (PDFs and links) */
router.get('/articles', function(req, res, next){
	Asset.find({ section: 'article' }, function(err, articles){
		if(err)
			return next(err);

		res.json(articles);
	});
});



/* GET home page. */
router.get('/', function(req, res, next){
  	res.render('index', {title: "Tony Leliw | Home"});
});

module.exports = router;