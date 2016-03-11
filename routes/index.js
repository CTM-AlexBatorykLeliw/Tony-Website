var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Asset = mongoose.model('Assets');
var config = require('../config');
// Module and variable for Mailer
var nodemailer = require("nodemailer");
var mailer = config.mailer;

/* GET the Main page of the site. This is where we host all the partials */
router.get('/', function(req, res){
	res.render('index');
});

/************************** UPLOADS *****************************/
/* AUTHENTICATION FOR THE UPLOADS PAGE */
router.post('/uploads', function(req, res){
	var secret = req.body.secret;
	var user = {};
	user.authorised = secret === config.uploadSecret ? true : false;
	res.render('uploads', user);
});

router.get('/uploads/:key', function(req, res){
	var secret = req.params.key;
	var user = {};
	user.authorised = secret === config.uploadSecret ? true : false;
	res.render('uploads', user);
});

router.get('/uploads', function(req, res){
	var user = { authorised: false };
	res.render('uploads', user);
});

/* GET all assets */
router.get('/info', function(req, res, next){
	Asset.find(function(err, assets){
		if(err)
			return next(err);

		res.json(assets);
	});
});

/* GET specific asset */
router.get('/info/:asset_id', function(req, res, next){
	Asset.findById(req.params.asset_id, function(err, asset){
		if(err)
			return next(err);

		res.json(asset);
	});
});

/* POST Asset into DB */
router.post('/info', function(req, res, next){
	var asset = new Asset(req.body);

	asset.save(function(err, asset){
		if(err)
			return next(err);

		res.json(asset);
	});
});

/* UPDATE asset in DB */
router.put('/info/:asset_id', function(req, res, next){
	Asset.findById(req.params.asset_id, function(err, asset){
		if(err)
			return next(err);

		if(req.body.title)
			asset.title = req.body.title;
		if(req.body.desc)
			asset.desc = req.body.desc;
		if(req.body.section)
			asset.section = req.body.section;
		if(req.body.link)
			asset.link = req.body.link;
		if(req.body.name)
			asset.name = req.body.name;
		if(req.body.folder)
			asset.folder = req.body.folder;

		asset.save(function(err){
			if(err)
				return res.send(err);

			return res.send('Asset updated');
		});

	});
});

/* DELETE asset */
router.delete('/info/:asset_id', function(req, res, next){
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

/************************** MEDIA *****************************/
/* GET all images */
router.get('/media/images', function(req, res, next){
	Asset.find({ type: 'image'}, function(err, assets){
		if(err)
			return next(err);

		res.json(assets);
	});
});

/* GET all videos */
router.get('/media/videos', function(req, res, next){
	Asset.find({ type: 'video'}, function(err, assets){
		if(err)
			return next(err);

		res.json(assets);
	});
});

/* GET all audio */
router.get('/media/audio', function(req, res, next){
	Asset.find({ type: 'audio'}, function(err, assets){
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

/************************** CONTACT *****************************/
/* Send email using the form */
router.post('/contact', function(req, res, next){
	var transporter = nodemailer.createTransport("smtps://" + mailer.sender + ":" + mailer.password+"@" + mailer.host);

	var mail = {
		from: req.body.name + ' <' + req.body.email + '>',
		to: mailer.recipient,
		subject: "Message from the website!",
		text: req.body.text + '\n\n' + "Email: " + req.body.email
	};

	transporter.sendMail(mail, function(err, res){
        if(err)
            return next(err);

        transporter.close();
    });

    res.json("email sent");
});

module.exports = router;