define(['require', 'router', 'views/card', 'views/sidebar'], function(require, Router, CardView, SidebarView){
	"use strict";

	var $ = require('jquery'),
			_ = require('underscore'),
			Backbone = require('backbone');

	var ReviewView = Backbone.View.extend({

		className: "review container",

		template: Handlebars.compile($('#review-template').html()),

		events: {
			"click .next": "randomCard",
			"click .restart": "restart",
		},

		initialize: function(options) {
			this.view = options.view;

			// Build review view & add sidebar view
			$("#app").html(this.el);

			this.listenTo(this.collection, "reset", this.render);
			this.render();
		},

		// Re-render the querys of the card item.
		render: function() {
			// create array of card indexes
			this.remaining = Array(this.collection.length).join().split(',').map(function(a){return this.i++;},{i:0});
			this.$el.html(this.template());

			// render sidebar view
			var sidebar = new SidebarView({view: this.view, collection: this.collection});
			this.$el.find("#sidebar").html(sidebar.el);

			this.addAll();
			this.randomCard();

			return this;
		},

		// Add a single card item to the list by creating a view for it
		addOne: function(card) {
			var view = new CardView({model: card, view: this.view});
			this.$("#cardreview").append(view.render().el);
		},

		// Add all items in the collection at once.
		addAll: function() {
			this.collection.each(this.addOne, this);
		},

		// select random card from remaining cards
		randomCard: function(){
			if (this.primary) {
				this.primary.active(false);
			}
			if (this.remaining.length && this.collection.length) {
				var randint = _.random(this.remaining.length - 1);
				var index = this.remaining[randint];
				var card = this.collection.models[index];
				this.remaining.splice(randint, 1);
				card.active(true);
				this.primary = card;
			} else {
				if (this.collection.length) {
					this.$('.end .card').show();
				} else {
					this.$('.empty .card').show();
				}
				this.$('.next').hide();
			}
		},

		restart: function(){
			this.$('.end .card').hide();
			this.$('.next').show();
			this.remaining = Array(this.collection.length).join().split(',').map(function(a){return this.i++;},{i:0});
			this.randomCard();
		},

		nextCard: function(){
			this.randomCard();
		},

	});

	return ReviewView;
});
