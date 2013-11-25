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

		addLabel: function(label) {
			var answers = this.get("answers");
			if (answers.indexOf(label) === -1) {
				answers.push({label: label, answer: "?"});
				this.set("answers", answers);
				this.trigger("change");
			}
		},

		removeLabel: function(label) {
			var answers = this.get("answers");
			answers = _.filter(answers, function(answer){
				return answer.label !== this.label;
			}, {label: label});
			this.set("answers", answers);
			this.trigger("change");
		}

	});

	return Card;
});