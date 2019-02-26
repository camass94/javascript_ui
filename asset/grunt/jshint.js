module.exports = {
    options: {
        jshintrc: '.jshintrc',
        //extensions: '', // A list of non-dot-js extensions to check.
        //ignores: [], // A list of files and dirs to ignore. This will override your .jshintignore file if set and does not merge.
        force: true, // Set force to true to report JSHint errors but not fail the task.
        // ignore specific warnings
        //'-W030': true // sample
        reporterOutput: 'docs/reports/jshint.txt'
        // reporter: function (res) {
        //  var len = res.length;
        //  var str = "";

        //  res.forEach(function (r) {
        //      var file = r.file;
        //      var err = r.error;

        //      str += file + ": line " + err.line + ", col " + err.character + ", " + err.reason + "\n";
        //  });

        //  if (str) {
        //      // process.stdout.write(str + "\n" + len + " error" +((len === 1) ? "" : "s") + "\n");
        //      return str + "\n" + len + " error" +((len === 1) ? "" : "s") + "\n";

        //  }
        // }
    },
    all: [
        'Gruntfile.js',
        'ui/lg4-common-<%= paths.local %>/js/**/*.js'
    ]
};
