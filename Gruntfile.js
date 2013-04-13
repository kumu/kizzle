module.exports = function( grunt ) {
	"use strict";

	var gzip = require( "gzip-js" ),
		files = {
			source: "src/sizzle.js",
			speed: "speed/speed.js",
			tests: "test/unit/*.js",
			grunt: [ "Gruntfile.js", "tasks/*" ]
		};

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
		qunit: {
			files: [ "test/index.html" ]
		},
		compile: {
			all: {
				dest: "dist/kizzle.js",
				src: "kizzle.js",
				sizzle: "sizzle.js"
			}
		},
		coffee: {
			compile: {
				options: {
					bare: true
				},
				files: {
					"kizzle.js": "kizzle.coffee"
				}
			}
		},
		version: {
			files: [ "package.json", "bower.json" ]
		},
		uglify: {
			all: {
				files: {
					"dist/kizzle.min.js": [ "dist/kizzle.js" ]
				},
				options: {
					compress: {
						evaluate: false,
						hoist_funs: false,
						loops: false
					},
					banner: "/*! Kizzle v<%= pkg.version %> | (c) 2013 Kumu Systems LLC | All rights reserved */",
					sourceMap: "dist/kizzle.min.map",
					beautify: {
						ascii_only: true
					}
				}
			}
		},
		compare_size: {
			files: [ "dist/kizzle.js", "dist/kizzle.min.js" ],
			options: {
				compress: {
					gz: function( contents ) {
						return gzip.zip( contents, {} ).length;
					}
				},
				cache: "dist/.sizecache.json"
			}
		},
		bowercopy: {
			options: {
				clean: true
			},

			speed: {
				options: {
					destPrefix: "speed/libs"
				},

				files: {
					"requirejs/require.js": "requirejs/require.js",
					"requirejs-domready/domReady.js": "requirejs-domready/domReady.js",
					"requirejs-text/text.js": "requirejs-text/text.js",
					"benchmark/benchmark.js": "benchmark/benchmark.js"
				}
			},

			"test/libs/qunit": "qunit/qunit"
		},
		jshint: {
			source: {
				src: [ "kizzle.js" ], // files.source
				options: {
					jshintrc: "src/.jshintrc"
				}
			},
			grunt: {
				src: files.grunt,
				options: {
					jshintrc: ".jshintrc"
				}
			},
			speed: {
				src: files.speed,
				options: {
					jshintrc: "speed/.jshintrc"
				}
			},
			tests: {
				src: files.tests,
				options: {
					jshintrc: "test/.jshintrc"
				}
			}
		},
		jscs: {
			// Can't check the actual source file until
			// https://github.com/mdevils/node-jscs/pull/90 is merged
			files: [ files.grunt, files.speed ],

			options: {
				preset: "jquery",
			}
		},
		jsonlint: {
			pkg: {
				src: [ "package.json" ]
			},
			bower: {
				src: [ "bower.json" ]
			}
		},
		watch: {
			files: [
				files.source,
				files.grunt,
				files.speed,
				"<%= jshint.tests.src %>",
				"{package,bower}.json",
				"test/index.html"
			],
			tasks: "default"
		}
	});

	// Integrate Sizzle specific tasks
	// grunt.loadTasks( "tasks" );

	// Load dev dependencies
	// require( "load-grunt-tasks" )( grunt );

	// grunt.registerTask( "lint", [ "jsonlint", "jshint", "jscs" ] );
	// grunt.registerTask( "build", [ "lint", "compile", "uglify", "dist" ] );
	// grunt.registerTask( "test", [ "lint", "qunit" ] );
	// grunt.registerTask( "default", [ "build", "qunit", "compare_size" ] );

	grunt.registerMultiTask(
		"build",
		"Build sizzle.js to the dist directory. Embed date/version.",
		function() {
			var data = this.data,
				dest = data.dest,
				src = data.src,
				sizzle = data.sizzle,
				version = grunt.config("pkg.version"),
				compiled = grunt.file.read(sizzle) + "\n\n\n" + grunt.file.read( src );

			// Embed version and date
			compiled = compiled
				.replace( /@VERSION/g, version )
				.replace( "@DATE", function () {
					var date = new Date();

					// YYYY-MM-DD
					return [
						date.getFullYear(),
						( "0" + ( date.getMonth() + 1 ) ).slice( -2 ),
						( "0" + date.getDate() ).slice( -2 )
					].join( "-" );
				});

			// Write source to file
			grunt.file.write( dest, compiled );

			grunt.log.ok( "File written to " + dest );
		}
	);

	// Process files for distribution
	grunt.registerTask( "dist", function() {
		var files = grunt.file.expand( { filter: "isFile" }, "dist/*" );

		files.forEach(function( filename ) {
			var map,
				fs = require("fs"),
				text = fs.readFileSync( filename, "utf8" );

			// Modify map/min so that it points to files in the same folder;
			// see https://github.com/mishoo/UglifyJS2/issues/47
			if ( /\.map$/.test( filename ) ) {
				text = text.replace( /"dist\//g, "\"" );
				fs.writeFileSync( filename, text, "utf-8" );
			} else if ( /\.min\.js$/.test( filename ) ) {
				// Wrap sourceMap directive in multiline comments (#13274)
				text = text.replace( /\n?(\/\/@\s*sourceMappingURL=)(.*)/,
					function( _, directive, path ) {
						map = "\n" + directive + path.replace( /^dist\//, "" );
						return "";
					});
				if ( map ) {
					text = text.replace( /(^\/\*[\w\W]*?)\s*\*\/|$/,
						function( _, comment ) {
							return ( comment || "\n/*" ) + map + "\n*/";
						});
				}
				fs.writeFileSync( filename, text, "utf-8" );
			}
		});
	});

	// Load grunt tasks from NPM packages
	grunt.loadNpmTasks("grunt-contrib-coffee");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-compare-size");
	grunt.loadNpmTasks("grunt-git-authors");

	// Default task
  // "jshint",
	grunt.registerTask( "default", [ "coffee", "build", "uglify", "dist", "qunit", "compare_size" ] );

	// Task aliases
	grunt.registerTask( "bower", "bowercopy" );
};
