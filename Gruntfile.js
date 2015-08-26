/**
 * - Get Bootstrap
 * - Get Bootstrap version
 * - Find all classes in Bootstrap
 * - Define all Bootstrap classes in a JSON and define their Suitstrap equivalent
 *
 * - Copy config-files
 */


module.exports = function(grunt) {
	"use strict";

	require("load-grunt-tasks")(grunt); // Load tasks
	require("time-grunt")(grunt); // Show time

	var replaceList = grunt.file.readJSON("replace.json");
	// pkg = grunt.file.readJSON("package.json");

	var suggestAlternative = function(match, type) {
		var suggestion;

		if (type == "imports") {
			suggestion = match.replace(/(?:@import ")(?!mixins\/)(.)|-(.)|\/(.)/g, function($0) {
				$0 = $0.replace("-", "");
				$0 = $0.toUpperCase();
				return $0;
			}).replace(/(@IMPORT)/g, function($0) {
				$0 = $0.toLowerCase();
				return $0;
			});
		} else {
			suggestion = match.replace(/\s(.)|-([a-z])/g, function($0) {
				$0 = $0.replace("-", "");
				$0 = $0.toUpperCase();
				return $0;
			});
		}

		return suggestion;
	};

	var writeSearchResultsJson = function(filepath, params, type, suggest) {
		suggest = typeof suggest !== "undefined" ? suggest : false;

		var singlelist = [],
			jsonlist = [],
			startSeperator,
			endSeperator;

		if (suggest) {
			startSeperator = "{\n";
			endSeperator = "\n}";
		} else {
			startSeperator = "[\n";
			endSeperator = "\n]";
		}

		var content = startSeperator;

		for (var file in params.results) {
			for (var i = 0; i < params.results[file].length; i++) {
				var contentMatch = params.results[file][i].match,
					alternativeContentMatch;

				if (suggest) {
					alternativeContentMatch = suggestAlternative(contentMatch, type);

					contentMatch = contentMatch.replace(/"/g, "\\\"");
					alternativeContentMatch = alternativeContentMatch.replace(/"/g, "\\\"");

					if (singlelist.indexOf(contentMatch) == "-1") {
						singlelist.push(contentMatch);
						jsonlist.push("\t\"" + contentMatch + "\" : \"" + alternativeContentMatch + "\"");
					}

				} else {
					if (singlelist.indexOf(contentMatch) == "-1") {
						singlelist.push(contentMatch);
						jsonlist.push("\t\"" + contentMatch + "\"");
					}
				}
			}
		}

		content += jsonlist.join(",\n");
		content += endSeperator;
		grunt.file.write(filepath, content);
	};




	// Project configuration.
	grunt.initConfig({



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
			// search: ["search"],
			bootstrap: ["src"],
			suitstrap: ["dist"]
		},



		gitclone: {
			clone: {
				options: {
					repository: "https://github.com/twbs/bootstrap",
					branch: "v4-dev",
					directory: "src"
				}
			}
		},



		search: {
			cssClasses: {
				files: {
					src: ["src/scss/**/*.scss"]
				},
				options: {
					searchString: /\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*\s*[\,\{]/g,
					logFormat: "custom",
					customLogFormatCallback: function(params) {
						writeSearchResultsJson("search/bootstrap-classes.json", params, "classes");
					}
				}
			},

			mixins: {
				files: {
					src: ["src/scss/**/*.scss"]
				},
				options: {
					searchString: /@mixin *(.*?)[\(|{]/g,
					logFormat: "custom",
					customLogFormatCallback: function(params) {
						writeSearchResultsJson("search/bootstrap-mixins.json", params, "mixins");
						writeSearchResultsJson("search/suitstrap-mixins.json", params, "mixins", true);
					}
				}
			},

			includes: {
				files: {
					src: ["src/scss/**/*.scss"]
				},
				options: {
					searchString: /@include* *([_a-zA-Z]+[_a-zA-Z0-9-])*/g,
					logFormat: "custom",
					customLogFormatCallback: function(params) {
						writeSearchResultsJson("search/bootstrap-includes.json", params, "includes");
						writeSearchResultsJson("search/suitstrap-includes.json", params, "includes", true);
					}
				}
			},

			functions: {
				files: {
					src: ["src/scss/**/*.scss"]
				},
				options: {
					searchString: /@function* *([_a-zA-Z]+[_a-zA-Z0-9-])*/g,
					logFormat: "custom",
					customLogFormatCallback: function(params) {
						writeSearchResultsJson("search/bootstrap-functions.json", params, "functions");
						writeSearchResultsJson("search/suitstrap-functions.json", params, "functions", true);
					}
				}
			},

			imports: {
				files: {
					src: ["src/scss/**/*.scss"]
				},
				options: {
					searchString: /@import "(.*?)"/g,
					logFormat: "custom",
					customLogFormatCallback: function(params) {
						writeSearchResultsJson("search/bootstrap-imports.json", params, "imports");
						writeSearchResultsJson("search/suitstrap-imports.json", params, "imports", true);
					}
				}
			}
		},


		replace: {
			classes: {
				options: {
					usePrefix: false,
					patterns: [{
						match: /(  )/g,
						replacement: function() {
							return "\t";
						}
					}, {
						json: replaceList.classes
					}, {
						json: replaceList.functions
					}, {
						json: replaceList.mixins
					}, {
						json: replaceList.includes
					}, {
						json: replaceList.imports
					}, {
						match: "bootstrap",
						replacement: "suitstrap"
					}, {
						match: "Bootstrap",
						replacement: "Suitstrap"
					}]
				},
				files: [{
					expand: true,
					cwd: "src/scss/",
					src: "**/*.scss",
					dest: "dist/scss",
					rename: function(dest, src) {
						if (src.indexOf("bootstrap") > -1) {
							src = src.replace(/([Bb]ootstrap)/g, function($0){
								return "suitstrap";
							});
						}

						src = src.replace(/_([\w])|-([\w])/g, function($0) {
							return $0.toUpperCase();
						}).replace(/\-/g, ""),
						src = src.replace(/(\.[sS]css)/g, ".scss");
						// src = "_" + src,

						return dest + "/" + src;
					}
				}]
			}
		},


		csscomb: {
			dist: {
				expand: true,
				cwd: "dist/scss",
				src: ["**/*.scss"],
				dest: "dist/combed/"
			}
		},



		watch: {
			grunt: {
				files: "<%= jshint.grunt.src %>",
				tasks: ["jshint:grunt", "jscs:grunt"]
			}
		}
	});


	grunt.registerTask("debug", "Debug something", function() {
		for (var property in replaceList.classes) {
			if (replaceList.classes.hasOwnProperty(property)) {
				grunt.log.writeln(property);
			}
		}
	});

	// Default task(s).
	grunt.registerTask("default", ["watch"]);

	grunt.registerTask("build", [
		"clean",
		"gitclone"
	]);

	grunt.registerTask("cleanReplace", [
		"clean:suitstrap",
		"replace"
	]);
};
