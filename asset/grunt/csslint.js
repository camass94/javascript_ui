// https://github.com/gruntjs/grunt-contrib-csslint
// https://github.com/stubbornella/csslint
module.exports = {
    options: {
        csslintrc: '.csslintrc',
        formatters: [
            {
                id: 'text',
                dest: 'docs/reports/csslint.txt'
            }
        ]
    },
    dev: {
        src: [
            '.tmp/dev/lg4-common-<%= paths.local %>/css/**/*.css',
            '!.tmp/dev/lg4-common-<%= paths.local %>/css/uncss.css'
        ]
    }
};
