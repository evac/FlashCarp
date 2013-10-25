define(['require', 'router', 'views/cardview', 'cards'], function(require, Router, CardView, Cards){
	"use strict";

	var $ = require('jquery'),
			_ = require('underscore'),
			Backbone = require('backbone'),
			Handlebars = require('handlebars');

	var TestView = Backbone.View.extend({

		className: "test",

		template: Handlebars.compile($('#test-template').html()),

		events: {
			"click #edit-set": "editSet",
			"click .next": "randomCard",
			"click .restart": "restart"
		},

		initialize: function(options) {
			this.view = options.view;

			$("#app").html(this.el);

			this.render();
			this.addAll();
			this.randomCard();

		},

		// Re-render the querys of the card item.
		render: function() {
			// create array of card indexes
			this.remaining = Array(Cards.length).join().split(',').map(function(a){return this.i++;},{i:0});

			this.$el.html(this.template());
			return this;
		},

		// Add a single card item to the list by creating a view for it
		addOne: function(card) {
			var view = new CardView({model: card, view: this.view});
			this.$("#cardreview").append(view.render().el);
		},

		// Add all items in the **Cards** collection at once.
		addAll: function() {
			Cards.each(this.addOne, this);
		},

		// select random card from remaining cards
		randomCard: function(){
			if (this.primary) {this.primary.active(false);}
			if (this.remaining.length && Cards.length) {
				var randint = _.random(this.remaining.length - 1);
				var index = this.remaining[randint];
				var card = Cards.models[index];
				this.remaining.splice(randint, 1);
				card.active(true);
				this.primary = card;
			} else {
				this.$('.end .card').show();
			}
		},

		restart: function(){
			this.$('.end .card').hide();
			this.remaining = Array(Cards.length).join().split(',').map(function(a){return this.i++;},{i:0});
			this.randomCard();
		},

		nextCard: function(){
			this.randomCard();
		},

		editSet: function() {
			Backbone.history.navigate("", {trigger: true});
		},
	});

	return TestView;
});
