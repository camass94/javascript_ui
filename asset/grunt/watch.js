module.exports = {
    compass: {
        files: ['<%= paths.src %>/lg4-common-<%= paths.local %>/scss/{,*/}**/*.*'],
        tasks: [
                //'newer:csscomb',
                'compass:dev',
                'compass:devie',
                'autoprefixer:dev'
            ] //, 'newer:csslint:dev'
    },
    html: {
        files: [
            '{<%= paths.src %>,<%= paths.tmpdev %>}/{,*/}*.html',
            '{<%= paths.src %>,<%= paths.tmpdev %>}/incl/{,*/}*.{html,incl,inc}'
        ],
        // tasks: ['jsbeautifier:src'],
        options: {
            livereload: false,
            reload: true
        }
    },
    js: {
        files: ['<%= paths.src %>/lg4-common-<%= paths.local %>/js/**/*.js']
            // , tasks: ['jsbeautifier:src']
    },
    livereload: {
        options: {
            livereload: true
        },
        files: [
            '{<%= paths.src %>,<%= paths.tmpdev %>}/{,*/}*.html',
            '{<%= paths.src %>,<%= paths.tmpdev %>}/incl/{,*/}*.{html,incl,inc}',
            '<%= paths.tmpdev %>/lg4-common-<%= paths.local %>/css/{,*/}*.css',
            '<%= paths.src %>/lg4-common-<%= paths.local %>/js/{,*/}*.js',
            '<%= paths.src %>/lg4-common-<%= paths.local %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
    }
};

var grunt = require('grunt');

if (grunt.option('sass')) {

    module.exports.compass = {
        files: [
            '<%=paths.src%>/lg4-common-<%=paths.local%>/scss/{,*/}*.{scss,sass}',
            '<%=paths.src%>/lg4-common-<%=paths.local%>/scss_imports/**/*.{scss,sass}'
        ],
        tasks: ["sass:dist"],
        options: {
            livereload: true
        }
    }

}