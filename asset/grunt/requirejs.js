module.exports = {
    dist: {
        options: {
            optimize: 'uglify',
            removeCombined: true,
            baseUrl: 'ui/lg4-common-<%= paths.local %>/js',
            mainConfigFile: ['ui/lg4-common-<%= paths.local %>/js/config.js', 'ui/lg4-common-<%= paths.local %>/js/modules.js'],
            dir: '<%= paths.tmpdist %>/lg4-common-<%= paths.local %>/js'
        }
    },
    distAmdClean: {
        options: {
            optimize: 'none',
            removeCombined: true,
            baseUrl: 'ui/lg4-common-<%= paths.local %>/js',
            mainConfigFile: ['ui/lg4-common-<%= paths.local %>/js/config.js', 'ui/lg4-common-<%= paths.local %>/js/modules-amdclean.js'],
            dir: '<%= paths.tmpdist %>/lg4-common-<%= paths.local %>/js',
            onModuleBundleComplete: function(data) {
                var fs = require('fs'),
                    amdclean = require('amdclean'),
                    outputFile = '.tmp/dist/lg4-common-<%= paths.local %>/js/' + data.path;

                fs.writeFileSync(outputFile, amdclean.clean({
                    'filePath': outputFile
                }));
            }
        }
    }
};
