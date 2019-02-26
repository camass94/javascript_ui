module.exports = {
    css: {
        expand: true,
        dot: true,
        cwd: '<%= paths.tmpdist %>',
        dest: '<%= paths.dist %>',
        src: [
            'lg4-common-<%= paths.local %>/js/{,*/}*.js',
            'lg4-common-<%= paths.local %>/css/{,*/}*.css',
            'lg4-common-<%= paths.local %>/oldie-css/{,*/}*.css'
        ]
    }
};
