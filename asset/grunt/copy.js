module.exports = {
    tmpdist: {
        /* HTML */
        files: [{
            expand: true,
            dot: true,
            cwd: '<%= paths.src %>',
            dest: '<%= paths.tmpdist %>',
            src: [
                '{,*/}*.html'
            ]
        },
        /* Includes */
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.src %>',
            dest: '<%= paths.tmpdist %>',
            src: [
                '{,*/}incl/{,*/,**/}*.*'
            ]
        }]
    },
    // For Distribution Builds
    dist: {
        files: [{
            expand: true,
            dot: true,
            cwd: '<%= paths.tmpdist %>',
            dest: '<%= paths.dist %>',
            src: [
                'lg4-common-<%= paths.local %>/js/{,*/}*.*'
            ]
        },
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.tmpdist %>',
            dest: '<%= paths.dist %>',
            src: [
                'lg4-common-<%= paths.local %>/css/{,*/}*.*'
            ]
        },
        /* Bower, will remove once require build is working right */
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.src %>',
            dest: '<%= paths.dist %>',
            src: [
                'lg4-common-<%= paths.local %>/bower_components/{,*/}*.*'
            ]
        },
        /* HTML From TMPDIST, will only overwrite if SSI-DIST task is run*/
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.tmpdist %>',
            dest: '<%= paths.dist %>',
            src: [
                '{,*/}*.html'
            ]
        },
        /* Images */
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.src %>',
            dest: '<%= paths.dist %>',
            src: [
                'lg4-common-<%= paths.local %>/img/{,*/,**/}*.{png,jpg,jpeg,gif}'
            ]
        },
        /* Content */
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.src %>',
            dest: '<%= paths.dist %>',
            src: [
                'lg4-common-<%= paths.local %>/content/{,*/,**/}*.*'
            ]
        },
        /* Content */
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.src %>',
            dest: '<%= paths.dist %>',
            src: [
                'img_sample/{,*/,**/}*.*'
            ]
        },
        /* Fonts */
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.src %>',
            dest: '<%= paths.dist %>',
            src: [
                'lg4-common-<%= paths.local %>/fonts/{,*/,**/}*.{eot,svg,ttf,woff,otf}'
            ]
        },
        /* Includes */
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.tmpdist %>',
            dest: '<%= paths.dist %>',
            src: [
                '{,*/}incl/{,*/,**/}*.*'
            ]
        },
        /* Other Files */
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.src %>',
            dest: '<%= paths.dist %>',
            src: [
                '*.{txt,xml,ht*}'
            ]
        }]
    },

    // Copy Documentation
    docs: {
        files: [{ /* Images */
            expand: true,
            dot: true,
            cwd: '<%= paths.src %>',
            dest: 'docs/css',
            src: ['lg4-common-<%= paths.local %>/img/{,*/,**/}*.{png,jpg,jpeg,gif}']
        },
        /* Fonts */
        {
            expand: true,
            dot: true,
            cwd: '<%= paths.src %>',
            dest: 'docs/css',
            src: ['lg4-common-<%= paths.local %>/fonts/**']
        }]
    }
};
