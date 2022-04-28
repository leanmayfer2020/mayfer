const express = require('express'),
      path = require('path'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      main = require('./controllers/MainController'),
      helpers        = require('./utils/hbs_helpers'),
      hbs = require('hbs'),
      config      = require('./config/config'),
      createError = require('http-errors'),
      services = require('./services/service'),
      logger = require('morgan'),
      // fileUpload = require('express-fileupload'),
      mongoose = require('mongoose'),
      webpush = require("web-push"),
      env             = process.env.APP_ENV || 'dev',
      xBrand          = process.env.APP_BRAND.toLowerCase(),
      indexRouter = require('./routes/'+xBrand+'/index'),
      app = express();
 

const sendEmailsJob = require("./jobs/sendEmailsJob");

// Test push notifications
//webpush.setVapidDetails("mailto:test@test.com", config.push_notifications.publicVapidKey, config.push_notifications.privateVapidKey);

// app.use(fileUpload());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/statics', express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  services.getCategories().then(function(categories){
      res.status(err.status || 500);
      res.render('error', {error:err.message, config:config, brand:xBrand, categories:categories});
    }).catch(function (errorCategories){
      res.status(err.status || 500);
      res.render('error', {error:err.message, config:config, brand:xBrand});
  })
});

hbs.registerPartials(__dirname + '/views/modules/');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

console.log("Environment ", env, xBrand);
console.log("MONGO-BRAND ", xBrand, config.mongo_uri_connect);

mongoose.connect(config.mongo_uri_connect, { useNewUrlParser: true, useFindAndModify: false });

mongoose.connection
  .on('connected', () => console.log('mongo connected'))
  .on('error', () => {
      throw new Error("unable to connect to database: ", config.mongo_uri_connect);
  });


if(env != "dev"){
  sendEmailsJob.sendEmailsToPotentialCustomer;
}

module.exports = app;
