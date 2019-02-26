var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
var sassMiddleWare = require('node-sass-middleware');
var connectSSI = require('connect-ssi');
var fs = require('fs');
app.use(connectSSI({
    ext: '.js.inc',
    baseDir: __dirname + '/ui'
}));
app.use(connectSSI({
    ext: '.inc',
    baseDir: __dirname + '/ui'
}));
app.use(connectSSI({
    ext: '.incl',
    baseDir: __dirname + '/ui'
}));
app.use(connectSSI({
    ext: '.html',
    baseDir: __dirname + '/ui'
}));
app.use(sassMiddleWare({
    src: path.join(__dirname, 'ui/lg4-common-ar/scss'),
    dest: path.join(__dirname, 'ui/lg4-common-ar/css'),
    debug: true,
    indentedSyntax: false,
    sourceMap: true,
    prefix: '/lg4-common-ar/css'
}));
app.use(sassMiddleWare({
    src: path.join(__dirname, 'ui/lg4-common-gp/scss'),
    dest: path.join(__dirname, 'ui/lg4-common-gp/css'),
    debug: true,
    indentedSyntax: false,
    sourceMap: true,
    prefix: '/lg4-common-gp/css'
}));
app.use(sassMiddleWare({
    src: path.join(__dirname, 'ui/lg4-common-global/scss'),
    dest: path.join(__dirname, 'ui/lg4-common-global/css'),
    debug: true,
    indentedSyntax: false,
    sourceMap: true,
    prefix: '/lg4-common-global/css'
}));
app.use(sassMiddleWare({
    src: path.join(__dirname, 'ui/lg4-common/scss'),
    dest: path.join(__dirname, 'ui/lg4-common/css'),
    debug: true,
    indentedSyntax: false,
    sourceMap: true,
    prefix: '/lg4-common/css'
}));
app.use(function(req, res, next) {
    if (req.method != 'POST') return next();

    var originalUrl = req.originalUrl,
        exts        = ['html','json'],
        ext         = originalUrl.split('.')[originalUrl.split('.').length-1],
        filePath    = path.join(process.cwd(), 'ui', originalUrl),
        alertText   = '<script>alert("존재하지 않는 파일입니다.")</script>';

    if (exts.indexOf(ext) < 0) return;

    fs.exists(filePath, function(result) {
        if (!result) return res.end(alertText);
        fs.readFile(filePath, 'utf8', function(result, body) {
            return res.send(body);
        });
    });
});
app.use(express.static(path.join(__dirname, 'ui')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
