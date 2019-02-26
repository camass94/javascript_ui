var grunt = require('grunt');

var param = (function(grunt){
	var result = {
		local:grunt.option('local') || 'gp',
		file:grunt.option('sass') || ''
	}
	return result;
})(grunt);

grunt.log.subhead('Your local '+param.local.toUpperCase()+'...Ok!');
if(param.file) grunt.log.ok('File is '+param.file+'...Ok!');

module.exports = {
    src: 'ui',
    dist: 'dist/dist-' + param.local,
    tmp: '.tmp-' + param.local,
    tmpdev: '.tmp/dev-' + param.local,
    tmpdist: '.tmp/dist-' + param.local,
    docs: 'docs-' + param.local,
	local: param.local,
	file: param.file
};
