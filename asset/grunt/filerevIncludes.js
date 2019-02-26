module.exports = {
    dist: {
        options: {
            fileRoot: '<%= paths.tmpdist %>/'
        },
        files: [{
            dest: '<%= paths.tmpdist %>/incl'
        }]
    }
};
