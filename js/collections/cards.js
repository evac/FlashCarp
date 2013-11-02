define(function(require){
	"use strict";

	var $ = require('jquery'),
			Backbone = require('backbone'),
			LocalStorage = require('localstorage'),
			Card = require('models/card');

	// The collection of cards is backed by *localStorage* instead of a remote
	// server.
	var CardSet = Backbone.Collection.extend({
		model: Card,

		demoURL: "https://s3.amazonaws.com/evachen/demo-sets.json",

		// Save all of the card items under the 'cards' namespace.
		localStorage: new Backbone.LocalStorage("cards"),

		initialize: function(){
			this.fetchDemoData();
		},

		fetchDemoData: function(set){
			var self = this;

			$.getJSON(this.demoURL).then(function (data){
				self.demosets = data;
			});
		},

		fetchDemoSet: function(set){
			this.reset(this.demosets[set]);
		}
	});

	return CardSet;
});