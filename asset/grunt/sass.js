module.exports = {
	options: {
		sourceMap: true
	},
	dist: {
		files: {
			'<%= paths.tmpdev %>/lg4-common-<%=paths.local %>/css/<%=paths.file%>.css':'<%=paths.src %>/lg4-common-<%=paths.local%>/scss/<%=paths.file%>.scss',
			'<%= paths.tmpdev %>/lg4-common-<%=paths.local %>/css/<%=paths.file%>-m.css':'<%=paths.src %>/lg4-common-<%=paths.local%>/scss/<%=paths.file%>-m.scss'
		},
		includePaths: [
			'<%=paths.src%>/lg4-common-<$=paths.local%>/scss',
			'<%=paths.src%>/lg4-common-<$=paths.local%>/scss_imports'
		]
	}
};
