module.exports = function( grunt ) {

	"use strict";

	var gzip = require("gzip-js");

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		qunit: {
			files: ["test/index.html"]
		},
		build: {
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
		uglify: {
			all: {
				files: {
					"dist/kizzle.min.js": [ "dist/kizzle.js" ]
				},
				options: {
					compress: { evaluate: false },
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
		jshint: {
			source: {
				src: [ "kizzle.js" ],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			grunt: {
				src: [ "Gruntfile.js" ],
				options: {
					jshintrc: ".jshintrc"
				}
			},
			speed: {
				src: [ "speed/speed.js" ],
				options: {
					jshintrc: "speed/.jshintrc"
				}
			},
			tests: {
				src: [ "test/unit/*.js" ],
				options: {
					jshintrc: "test/.jshintrc"
				}
			}
		},
		watch: {
			files: [
				"<%= jshint.source.src %>",
				"<%= jshint.grunt.src %>",
				"<%= jshint.speed.src %>",
				"<%= jshint.tests.src %>"
			],
			tasks: "default"
		}
	});

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
	grunt.registerTask( "lint", ["jshint"] );
};
