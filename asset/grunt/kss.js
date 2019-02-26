// https://github.com/t32k/grunt-kss
module.exports = {
    options: {
        //includeType: 'sass',
        //includePath: 'ui/scss/global.scss',
        template: 'docs/templates/css-styleguide'
    },
    docs: {
        files: {
            'docs/css/': ['ui/lg4-common-<%= paths.local %>/scss']
        }
    }
};
