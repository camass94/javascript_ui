module.exports = {
    dynamic_mappings: {
        expand: true,
        dot: true,
        cwd: '<%= paths.src %>/lg4-common-<%= paths.local %>/scss',
        src: ['**/*.{scss,css}'],
        dest: '<%= paths.src %>/lg4-common-<%= paths.local %>/scss/',
        ext: '.scss'
    }
};
