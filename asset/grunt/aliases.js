module.exports = {
    'default': [
        'clean:server',
        'compass:dev',
        'compass:devie',
        'modernizr:dev',
        'autoprefixer:dev',
        'jshint:all',
        'connect:server',
        'watch'
    ],
    'rev': [
        'filerev',
        'filerevIncludes:dist',
        'filerevSummary'
    ],
    'jsbuild': [
        'clean:dist',
        'requirejs:dist',
        'modernizr:dist',
        'copy:tmpdist',
        'copy:dist'
    ],
     'csbuild': [
        'cmq:dynamic',
        'cssmin:target'
    ],
    'cssbuild': [
        'clean:dist',
        'compass:dist',
        'compass:distie',
        'cmq:dynamic',
        'cssmin:target',
        'copy:dist'
    ],
    'rev': [
        'filerev',
        'filerevIncludes:dist',
        'filerevSummary'
    ],
    'build': [
        'clean:dist',
        'compass:dist',
        'compass:distie',
        'cmq:dynamic',
        'cssmin:target',
        'requirejs:dist',
        'modernizr:dist',
        'filerev',
        'filerevIncludes:dist',
        'filerevSummary',
        //'copy:tmpdist',
        'autoprefixer:dist',
        'processhtml',
        'copy:dist'
    ],
    'build-ssi': [
        'clean:dist',
        'compass:dist',
        'compass:distie',
        'requirejs:dist',
        'modernizr:dist',
        'filerev',
        'filerevIncludes:dist',
        'copy:tmpdist',
        'autoprefixer:dist',
        'processhtml',
        'ssi:dist',
        // 'copy:dist',
        // 'connect:dist'
    ],
    'lint': [
        'newer:jshint:all',
        'newer:csslint:dev'
    ],
    'docs': [
        'clean:docs',
        'jsdoc:dist',
        'kss:docs',
        'compass:docs',
        'copy:docs',
        'connect:docs'
    ],
    'testlocal': [
        'gremlins:local'
    ],
    'font' : [
        'webfont:lgIcons',
        'webfont:exampleIcon'
    ]
};
