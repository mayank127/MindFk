var fs = require('fs');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var env = process.env.NODE_ENV || 'default';
var config = require('config');

var app = express();


// configure express app
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

// configure routes
var routes = require('./routes/index');
app.use('/', routes);

// launch app server
var server = require('http').createServer(app).listen(80);

require('./config/socket.js')(server);

module.exports = app;
