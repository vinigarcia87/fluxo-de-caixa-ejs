// Configurar variáveis de ambiente ANTES de tudo
require('dotenv').config();

// Validar variáveis de ambiente
const { validateEnv } = require('./config/env-validator');
validateEnv();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var fluxoCaixaRouter = require('./routes/fluxo-caixa');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configurar logger baseado no ambiente
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(logger(logFormat));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.SESSION_SECURE === 'true',
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Middleware para mensagens flash
app.use(function(req, res, next) {
  res.locals.message = req.session.message;
  res.locals.error = req.session.error;
  delete req.session.message;
  delete req.session.error;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/fluxo-caixa', fluxoCaixaRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
