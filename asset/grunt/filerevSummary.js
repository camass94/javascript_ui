module.exports = {
	dist: {
		options: {
			fileRoot: '<%= paths.tmpdist %>/',
			destFile: '<%= paths.dist %>/webresource-<%= paths.local %>.properties'
		},
		files: [{
			dest: '<%= paths.tmpdist %>/incl'
		}]
	}
};
