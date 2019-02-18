var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var hbs = require('express-handlebars');
var handleBars = require('handlebars');
var morgan = require('morgan');
var path = require('path');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultView: 'default',
  layoutsDir: __dirname + '/views/'
}));

handleBars.registerHelper('markdown', require('helper-markdown'));

app.use(morgan('[:date[web]] :method :url :status :response-time ms - :res[content-length]'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/shop/assets", express.static(path.join(__dirname, 'public/')));
app.use(express.static(path.join(__dirname, '.well-known')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;