define(['require', 'views/editor', 'views/review', 'views/header', 'collections/cards'], function(require, EditorView, ReviewView, HeaderView, CardSet){
	"use strict";

	var $ = require('jquery'),
			Backbone = require('backbone');

	var Router = Backbone.Router.extend({
		routes: {
			"": "editor",
			"review": "review",
		},

		initialize: function(){
			this.Cards = new CardSet();
			this.Cards.fetch();
		},

		editor: function() {
			this.loadView(new EditorView({view: "editor", collection: this.Cards}));
		},

		review: function() {
			this.loadView(new ReviewView({view: "review", collection: this.Cards}));
		},

		loadView: function(view){
			if (this.view) {this.view.remove();}
			this.view = view;
			new HeaderView({view: view.view, collection: view.collection});
		}

	});

	return Router;

});