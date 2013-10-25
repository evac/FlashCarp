require.config({
	paths: {
		underscore: 'libs/underscore',
		jquery: 'libs/jquery',
		backbone: 'libs/backbone',
		localstorage: 'libs/backbone.localStorage',
		handlebars: 'libs/handlebars',
		templates: '../templates'
	},

	shim: {
		// Load dependencies to ensure Backbone works as expected within the AMD
		// environment.
		"underscore": {
			exports: "_"
		},
		"backbone": {
			deps: ["jquery", "underscore"],

			// This maps the global `Backbone` object to `require("backbone")`.
			exports: "Backbone"
		},
		"handlebars": {
			exports: "Handlebars"
		}
	}
});

require(['app'], function(App){
	"use strict";

	App.initialize();
});