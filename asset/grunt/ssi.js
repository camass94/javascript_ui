module.exports = {
    options: {
        baseDir: '<%= paths.src %>',
        cacheDir: '<%= paths.tmpdev %>/.ssiCache'
    },
    server: {
        options: {
            cache: 'all'
        },
        files: [{
            expand: true,
            cwd: '<%= paths.src %>',
            src: [
                '**/*.html',
                '!bower_components/**/*.html'
            ],
            dest: '<%= paths.tmpdev %>'
        }]
    },
    dist: {
        options: {
            cache: 'all',
            baseDir: '<%= paths.tmpdist %>'
        },
        files: [{
            expand: true,
            cwd: '<%= paths.tmpdist %>',
            src: [
                '**/*.html',
                '!bower_components/**/*.html'
            ],
            dest: '<%= paths.dist %>'
        }]
    }
};
