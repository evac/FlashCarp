define(function(require){
	"use strict";

	var $ = require('jquery'),
			Backbone = require('backbone');


	var Card = Backbone.Model.extend({

		// Default attributes for the card item.
		defaults: function() {
			return {
				query: "",
				answers: [],
				active: false,
			};
		},

		initialize: function() {
			this.set(this.defaults);
		},

		active: function(value){
			this.set("active", value);
		},

	});

	return Card;
});