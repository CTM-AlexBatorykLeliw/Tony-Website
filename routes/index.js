var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Asset = mongoose.model('Assets');
var config = require('../config');
var fs = require('fs');
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

/* Upload ALL assets into server */
var multer = require('multer');
var upload = multer({ storage:
	multer.diskStorage({
	  	destination: function(req, file, callback){
	  		var path = "./public/assets";	
	  		switch(req.body.type)
	  		{
	  			case 'link': path += '/link'; break;
	  			case 'PDF': path += '/PDF'; break;
	  			case 'video': path += '/video'; break;
	  			case 'audio': path += '/audio'; break;
	  			case 'image': path += '/image/' + req.body.folder; break;
	  		}
	    	callback(null, path);
	  	},
	  	filename: function(req, file, callback){
	    	callback(null, file.originalname);
	  	}
	})
});
/* Middleware to upload assets into database and add to server */
function myUpload(multUpload){
	return function(req, res, next){
		multUpload(req, res, function(err){
			if(err)
				return next(err);

			var asset = new Asset(req.body);
			asset.save(function(err, asset){
				if(err)
					return next(err);

				res.render('uploads', {authorised: true});
			});
		});
	}
}

/* POST Asset into DB and upload to server */
router.post('/info', myUpload(upload.single('file')), function(req, res, err, next){
	if(err)
		return res.send("Err: " + err);

	res.render('uploads', {authorised: true});
});

/* GET all of the image folders in the server */
router.get('/info/image/folders', function(req, res, next){
	var folders = fs.readdirSync('./public/assets/image');
	res.json(folders);
});

/* POST a folder into the image assets in the server */
router.post('/info/image/folders/add', function(req, res, next){
	console.log(req.body.name);
	fs.mkdir('./public/assets/image/' + req.body.name);
	res.json("Folder made");
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
		if(req.body.path)
			asset.path = req.body.path;
		if(req.body.folder)
			asset.folder = req.body.folder;
		if(req.body.name)
			asset.name = req.body.name;

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

router.put('/articles/:asset_id/visit', function(req, res, next){
	Asset.findById(req.params.asset_id, function(err, asset){
		if(err)
			return next(err);

		asset.visits = asset.visits + 1;

		asset.save(function(err){
			if(err)
				return res.send(err);

			return res.send('Asset updated');
		});
	});
});

/************************** ARTICLE LINKS ***********************/
router.get('/articles/link/:id', function(req, res, next){
	res.render('link', { path: req.params.id });
});

/************************** CONTACT *****************************/
/* Send email using the form */
router.post('/contact', function(req, res, next){
	var transporter = nodemailer.createTransport("smtps://" + mailer.sender + ":" + mailer.password+ "@" + mailer.host);

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