define(function(require){
	"use strict";

	var $ = require('jquery'),
			Backbone = require('backbone'),
			Handlebars = require('handlebars');

	var CardView = Backbone.View.extend({

		tagName: "li",

		cardTemplate: Handlebars.compile($('#card-template').html()),
		reviewTemplate: Handlebars.compile($('#qa-template').html()),
		fieldTemplate: Handlebars.compile($('#fields-template').html()),

		// The DOM events specific to an item.
		events: {
			"click .edit": "edit",
			"click .save": "save",
			"click .cancel": "cancel",
			"click a.destroy": "clear",
			"click .front .title": "reveal",
			"click .main": "hide",
		},

		// listen for changes to model 
		initialize: function(options) {
			this.view = options.view;
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'change:active', this.active);
			this.listenTo(this.model, 'destroy', this.remove);
			if (this.view === "review") {
				this.model.active(false); // reset model activeness
			}
		},

		// Re-render the querys of the card item based on editor or test mode.
		render: function() {
			var template;

			if (this.view === "review") {
				template = this.reviewTemplate(this.model.toJSON());
			} else {
				template = this.cardTemplate(this.model.toJSON());
			}

			this.$el.html(template);
			this.query = this.$('.update[name="query"]');
			this.answers = this.$('.answers');
			this.back = this.$('.back');
			return this;
		},

		// Switch this view into `"editing"` mode, displaying the input field.
		edit: function() {
			this.$el.addClass("editing");
		},

		// Close the `"editing"` mode, saving changes to the card.
		save: function(e) {
			var query = this.query.val();
			var answerList = this.answers.children();
			var answers = [];

			answerList.each(function(i) {
				var label = $(this).children("[name='label']").val();
				var answer = $(this).children("[name='answer']").val();
				if (label || answer) {
					answers.push({label: label, answer: answer});
				} else {
					$(this).remove();
				}
			});


			if (query && answers) {
				this.model.save({
					query: query,
					answers: answers
				});
				this.cancel();
			}
		},

		cancel: function() {
			this.$el.removeClass("editing");
		},

		active: function() {
			if (this.model.get("active")) {
				this.$el.addClass("active");
			} else {
				this.$el.removeClass("active");
			}
		},

		reveal: function(e) {
			var $target = $(e.target);
			var label = $target.data("label");
			var answer = $target.data("answer");
			this.$(".backface").children(".title").text(label);
			this.back.children(".answer").text(answer);
			$(".active").addClass("reveal");
		},

		hide: function(e) {
			$(".active").removeClass("reveal");
		},

		// Remove the item, destroy the model.
		clear: function() {
			this.model.destroy();
		}
	});

	return CardView;
});