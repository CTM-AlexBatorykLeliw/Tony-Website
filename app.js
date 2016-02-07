var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Modules for MongoDB
var mongoose = require('mongoose');
require('./models/Assets');
// Connection to MongoLab, they are hosting the mongoDB online. 500MB free
mongoose.connect('mongodb://AlexBatorykLeliw:Kingducky2008@ds055855.mongolab.com:55855/tony-website');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware for app
app.use(favicon(path.join(__dirname, 'public/images/book.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
// Serve npm modules into pages from folder
app.use('/modules', express.static(__dirname + '/node_modules/'));

// Middleware connecting routes to front-end pages
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next){
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// ERR handlers
// development error handler, will print stacktrace
if (app.get('env') === 'development')
    app.use(function(err, req, res, next){
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });

// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
