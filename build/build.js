({
	baseUrl: "../js",
	mainConfigFile: '../js/main.js',
	name: "../js/main",
	out: '../js/main.min.js',
	include: [
		"../js/require"
	],
	paths: {
		underscore: 'libs/underscore',
		jquery: 'libs/jquery',
		backbone: 'libs/backbone',
		localstorage: 'libs/backbone.localStorage',
		handlebars: 'libs/handlebars',
	},
	shim: {
		"underscore": {
			exports: "_"
		},
		"backbone": {
			deps: ["jquery", "underscore"],
			exports: "Backbone"
		},
		"handlebars": {
			exports: "Handlebars"
		},
		"bootstrap": {
			deps: ["jquery"]
		}
	}
})