module.exports = {
    options: {},
    dist: {
        files: [{
            expand: true,
            cwd: '<%= paths.tmpdist %>/',
            src: ['**/*.html'],
            dest: '<%= paths.tmpdist %>/',
            ext: '.html'
        }]
    }
};
