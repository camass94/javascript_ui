module.exports = {
    options: {
        log: true
    },
    dynamic: {
        expand: true,
        cwd: '<%= paths.tmpdist %>/lg4-common-<%= paths.local %>/css',
        src: ['*.css'],
        dest: '<%= paths.tmpdist %>/lg4-common-<%= paths.local %>/css'
    }
};
