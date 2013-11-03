define(['require', 'views/EditorView', 'views/ReviewView', 'collections/cards'], function(require, EditorView, ReviewView, CardSet){
	"use strict";

	var $ = require('jquery'),
			Backbone = require('backbone');

	var Router = Backbone.Router.extend({
		routes: {
			"": "index",
			"review": "review",
		},

		initialize: function(){
			this.Cards = new CardSet();
			this.Cards.fetch();
		},

		index: function() {
			this.loadView(new EditorView({view: "index", collection: this.Cards}));
		},

		review: function() {
			this.loadView(new ReviewView({view: "review", collection: this.Cards}));
		},

		loadView: function(view){
			if (this.view) {this.view.remove();}
			this.view = view;
		}

	});

	return Router;

});