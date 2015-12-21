'use strict';

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		eslint: {
			target: ['*.js']
		},
		mochaTest: {
			src: ['test.js']
		}
	});

	grunt.registerTask('default', ['eslint', 'mochaTest']);
};
