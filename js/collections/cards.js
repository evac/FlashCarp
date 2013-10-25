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

		// Save all of the card items under the 'cards' namespace.
		localStorage: new Backbone.LocalStorage("cards"),
	});

	return CardSet;
});