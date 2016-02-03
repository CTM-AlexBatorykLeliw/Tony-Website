var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var Asset = mongoose.model('Assets');

/* GET the Main page of the site. This is where we host all the partials */
router.get('/', function(req, res, next){
	res.render('index');
});

/* AUTHENTICATION FOR THE UPLOADS PAGE */
router.post('/uploads', function(req, res, next){
	var secret = req.body.secret;
	var user = {};
	user.authorised = secret === "ntR759Cf" ? true : false;
	res.render('uploads', user);
});

router.get('/uploads/:key', function(req, res){
	var secret = req.params.key;
	var user = {};
	user.authorised = secret === "ntR759Cf" ? true : false;
	res.render('uploads', user);
});

router.get('/uploads', function(req, res, next){
	var user = {
		authorised: false
	};
	res.render('uploads', user);
});

/************************** MEDIA *****************************/
/* GET all media (images and videos) */
router.get('/media', function(req, res, next, assetType){
	Asset.find({ section: 'media'}, function(err, assets){
		if(err)
			return next(err);

		res.json(assets);
	});
});

/************************** ARTICLES *****************************/
/* GET all links */
router.get('/articles/links', function(req, res, next){
	Asset.find({ type: 'link' }, function(err, articles){
		if(err)
			return next(err);

		res.json(articles);
	});
});

/* GET all PDFs */
router.get('/articles/PDFs', function(req, res, next){
	Asset.find({ type: 'PDF' }, function(err, articles){
		if(err)
			return next(err);

		res.json(articles);
	});
});

/************************** UPLOADS *****************************/
/* GET all assets */
router.get('/uploads', function(req, res, next){
	Asset.find(function(err, assets){
		if(err)
			return next(err);

		res.json(assets);
	});
});

/* POST Asset into DB */
router.post('/uploads', function(req, res, next){
	var asset = new Asset(req.body);

	asset.save(function(err, asset){
		if(err)
			return next(err);

		res.json(asset);
	});
});

/* DELETE asset */
router.delete('/uploads/:asset_id', function(req, res, next){
	Asset.findById(req.params.asset_id, function(err, asset){
		if(err)
			return next(err);

		asset.remove({}, function(err){
			if(err)
				return next(err);

			res.send('Asset deleted');
		});
	});
});

module.exports = router;