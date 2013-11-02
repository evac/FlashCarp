define(['require', 'views/EditorView', 'views/TestView', 'collections/cards'], function(require, EditorView, TestView, CardSet){
	"use strict";

	var $ = require('jquery'),
			Backbone = require('backbone');

	var Router = Backbone.Router.extend({
		routes: {
			"": "index",
			"test": "test",
		},

		initialize: function(){
			this.Cards = new CardSet();
			this.Cards.fetch();
		},

		index: function() {
			this.loadView(new EditorView({view: "index", collection: this.Cards}));
		},

		test: function() {
			this.loadView(new TestView({view: "test", collection: this.Cards}));
		},

		loadView: function(view){
			if (this.view) {this.view.remove();}
			this.view = view;
		}

	});

	return Router;

});