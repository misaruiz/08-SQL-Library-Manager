var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//db requires
// const db = require('./library.db');

// Test db connecttion
const { Sequelize } = require('./models/index').Sequelize;
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'library.db'
});

(async () => {
  // sync model to database
  await sequelize.sync({ force:true });

  // Test connection to database
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database: ', error);
  }
})();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.status === 404) {
    err.message = 'Page Not Found';
    res.render('page-not-found', {err});
  } else {
    err.message = 'Server Error';
    err.status = 500;
    // render the error page
    res.status(err.status || 500);
    res.render('error', {err});
    console.error(`${err.message}: ${err.status}` );
  }
});

module.exports = app;
