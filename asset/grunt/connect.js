var fs = require('fs');
var path = require('path');

module.exports = {
    options: {
        livereload: false //may need to be false
    },
    server: {
        options: {
            port: 80, // change this value if connect server fails with port already in use error
            hostname: "*",
            base: ['<%= paths.tmpdev %>','<%= paths.src %>'],
            //open: "http://156.147.129.91/gp/index.html",
            open: "http://localhost/ae_ar/support/index_ma.html",
            middleware: function(connect, options, middlewares) {

                var injectLiveReload = require('connect-livereload');
                var connectSSI = require('connect-ssi');

                var bases = options.base;
                var settings = {
                    baseDir: bases,
                    errorMessage: ''
                };

                //Rewrite the default middleware stack
                if (!Array.isArray(options.base)) {
                    options.base = [options.base];
                }
                var directory = options.directory || options.base[options.base.length - 1];

                options.base.forEach(function(base) {
                // Serve static files.
                    middlewares.push(connect.static(base));
                });

                middlewares.push(connect.directory(directory));
                if(options.directory) {bases.push(options.directory);}


                middlewares.unshift(jsonCall);
                middlewares.unshift(connectSSI(settings));

                function jsonCall(req, res, next) {

                    var reqMethod = req.method,
                        originalUrl = req.originalUrl,
                        splitUrl = originalUrl.split('.'),
                        filePath = path.join(process.cwd(), 'ui', originalUrl),
                        alertText = '<script>alert("존재하지 않는 파일입니다.")</script>';

                    if (reqMethod != 'POST' || splitUrl[splitUrl.length-1] != 'json') return next();

                    fs.exists(filePath, function(result) {
                        if (!result) return res.end(alertText);

                        fs.readFile(filePath, 'utf8', function(result, body) {
                            return res.end(body);
                        });
                    });
                }
                return middlewares;
            }
        }
    },
    dist: {
        options: {
            base: ['<%= paths.dist %>'],
            open: true,
            livereload: false,
            keepalive: true
        }
    },
    docs: {
        options: {
            port: 9000,
            base: ['<%= paths.docs %>'],
            open: true,
            keepalive: true
        }
    }
};
