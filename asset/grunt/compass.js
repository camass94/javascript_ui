module.exports = {
    options: {
        sassDir: '<%= paths.src %>/lg4-common-<%= paths.local %>/scss',
        cssDir: '<%= paths.tmpdev %>/lg4-common-<%= paths.local %>/css',
        imagesDir: '<%= paths.src %>/lg4-common-<%= paths.local %>/img',
        javascriptsDir: '<%= paths.src %>/lg4-common-<%= paths.local %>/js',
        fontsDir: '<%= paths.src %>/lg4-common-<%= paths.local %>/fonts',
        httpPath: '/',
        httpImagesPath: 'img',
        httpGeneratedImagesPath: '../img',
        httpFontsDir: 'fonts'
    },
    dev: {// dev build
        options: {
            importPath: '<%= paths.src %>/lg4-common-<%= paths.local %>/scss_imports/modern',
            environment: 'development'
        }
    },
    dist: {
        options: {
            cssDir: '<%= paths.tmpdist %>/lg4-common-<%= paths.local %>/css',
            importPath: '<%= paths.src %>/lg4-common-<%= paths.local %>/scss_imports/modern',
            environment: 'production'
        }
    },
    devie: {// dev build
        options: {
            cssDir: '<%= paths.tmpdev %>/lg4-common-<%= paths.local %>/oldie-css',
            importPath: '<%= paths.src %>/lg4-common-<%= paths.local %>/scss_imports/oldie',
            environment: 'development'
        }
    },
    distie: {
        options: {
            cssDir: '<%= paths.tmpdist %>/lg4-common-<%= paths.local %>/oldie-css',
            importPath: '<%= paths.src %>/lg4-common-<%= paths.local %>/scss_imports/oldie',
            environment: 'production'
        }
    },
    docs: {
        options: {
            cssDir: 'docs/css/public',
            httpImagesPath: 'css/img',
            generatedImagesDir: '../',
            httpGeneratedImagesPath: '../img',
            httpFontsDir: 'css/fonts'
        }
    }
};
