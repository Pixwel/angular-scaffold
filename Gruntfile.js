module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig({
		karma: {
			unit: {
				options: {
					browsers: ['PhantomJS'],
					frameworks: ['jasmine'],
					files: [
						'lib/angular.js',
						'lib/angular-mocks.js',
						'lib/angular-model.js',
						'src/*.js',
						'test/*.js'
					],
					singleRun: true
				}
			}
		},
		watch: {
			karma: {
				files: ['src/*.js', 'test/*.js'],
				tasks: ['karma:unit:run']
			}
		}
	});

	grunt.registerTask('default', [
		'karma:unit:start'
	]);
};
