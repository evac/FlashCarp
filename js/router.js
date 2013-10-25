define(['require', 'views/EditorView', 'views/TestView'], function(require, EditorView, TestView){
	"use strict";

	var $ = require('jquery'),
			Backbone = require('backbone'),
			Cards = require('cards');

	var Router = Backbone.Router.extend({
		routes: {
			"": "index",
			"test": "test",
		},

		initialize: function(){
			Cards.fetch();
		},

		index: function() {
			this.loadView(new EditorView({view: "index"}));
		},

		test: function() {
			this.loadView(new TestView({view: "test"}));
		},

		loadView: function(view){
			if (this.view) {this.view.remove();}
			this.view = view;
		}

	});

	return Router;

});