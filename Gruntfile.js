/**
 * - Get Bootstrap
 * - Get Bootstrap version
 * - Find all classes in Bootstrap
 * - Define all Bootstrap classes in a JSON and define their Suitstrap equivalent
 *
 * - Copy config-files
 */


module.exports = function (grunt) {
	"use strict";

	// Load tasks
	require("load-grunt-tasks")(grunt);

	// Show time
	require("time-grunt")(grunt);

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),



		jshint: {
			options: {
				jshintrc: ".jshintrc"
			},
			grunt: {
				src: ["Gruntfile.js", "grunt/*.js"]
			}
		},



		jscs: {
			grunt: {
				src: "<%= jshint.grunt.src %>"
			}
		},



		clean: {
			bootstrap: ["src"] // ,
			// suitstrap: ["dist"]
		},



		gitclone: {
			clone: {
				options: {
					repository: "https://github.com/twbs/bootstrap",
					branch: "master",
					directory: "src"
				}
			}
		},



		watch: {
			grunt: {
				files: "<%= jshint.grunt.src %>",
				tasks: ["jshint:grunt", "jscs:grunt"]
			}
		}

	});

	// Default task(s).
	grunt.registerTask("default", ["watch"]);

	grunt.registerTask("build", [
		"clean",
		"gitclone"
	]);
};
