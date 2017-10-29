var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//load all configurations in environment variables
var config = require('./config/config');

//Initialize database
var db = require('./db/mongoose');
var userController = require('./controllers/user');
var users = require('./routes/users');
var library = require('./routes/library');
var books = require('./routes/books');


var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/***********************************************************************************************************************
 * CORS
 ***********************************************************************************************************************/
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-access-id, client-time");
    res.header("Access-Control-Allow-Methods", 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    } else {
        next();
    }
});

//register api routes
app.use('/users', users);
app.use('/library', library);
app.use('/books', books);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
//create default ROOT
userController.createRootUser();

module.exports = app;
