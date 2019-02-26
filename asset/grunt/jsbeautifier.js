module.exports = {
    options: {
        mode: 'VERIFY_AND_WRITE'
    },
    src: {
        src: ['<%= paths.src %>/lg4-common-<%= paths.local %>/js/**/*.js', '<%= paths.src %>/*.html']
    }
};
