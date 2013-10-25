define(['require', 'router', 'views/cardview', 'cards'], function(require, Router, CardView, Cards){
	"use strict";

	var $ = require('jquery'),
			Backbone = require('backbone');

	var EditorView = Backbone.View.extend({

		className: "app",

		editorTemplate: Handlebars.compile($('#app-template').html()),
		editorFieldTemplate: Handlebars.compile($('#fields-template').html()),

		events: {
			"keypress #new-card": "createOnEnter",
			"click #delete-set": "clearAll",
			"click .remove-answer": "removeAnswer",
			"keydown .answers .answer:last-child [name='answer']": "newAnswer",
			"click #test-set": "testSet",
		},

		initialize: function(options) {
			$("#app").html(this.el);
			this.view = options.view;
			this.listenTo(Cards, 'add', this.addOne);
			this.render();
			this.addAll();
		},

		render: function() {
			this.$el.html(this.editorTemplate());
			this.$card = $("#new-card");
			return this;
		},

		testSet: function() {
			Backbone.history.navigate("test", {trigger: true});
		},

		// Add a single card item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function(card) {
			var view = new CardView({model: card, view: this.view});
			this.$("#cardset").append(view.render().el);
		},

		// Add all items in the **Cards** collection at once.
		addAll: function() {
			Cards.each(this.addOne, this);
		},

		newAnswer: function(e) {
			if (e.keyCode == 9) {
				var inputs = this.editorFieldTemplate();
				this.$("#new-card .answers").append(inputs);
				if ($(e.target).closest("#new-card").length) {
					$("html, body").animate({ scrollTop: $(document).height() }, "slow");
				}
			}
		},


		removeAnswer: function(e) {
			$(e.target).parent().remove();
		},

		// If you hit return in the main input field, create new **Card** model,
		// persisting it to *localStorage*.
		createOnEnter: function(e) {
			if (e.keyCode != 13) return;

			var queryEl = this.$card.find("[name='query']");
			var answersEl = this.$card.find(".answers");
			var query = queryEl.val();
			var answerList = answersEl.children();
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

			if (!query || !answers) return;

			Cards.create({query: query, answers: answers});

			// Reset form
			queryEl.val("");
			answersEl.html(this.editorFieldTemplate());
		},

		// Clear all cards
		clearAll: function() {
			var card;
			while (card = Cards.first()) {
				card.destroy();
			}
		},

	});

	return EditorView;
});