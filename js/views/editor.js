define(['require', 'router', 'views/card', 'views/sidebar'], function(require, Router, CardView, SidebarView){
	"use strict";

	var $ = require('jquery'),
			Backbone = require('backbone');

	var EditorView = Backbone.View.extend({

		className: "editor container",

		editorTemplate: Handlebars.compile($('#editor-template').html()),

		events: {
			"keypress #new-card": "createOnEnter",
			"click .add-card": "createOnEnter",
			"click .remove-answer": "removeAnswer",
			"keydown .answers .answer:last-child [name='answer']": "newAnswer",
			"click .add-field": "newAnswer"
		},

		initialize: function(options) {
			this.view = options.view;

			$("#app").html(this.el);

			Backbone.Events.on("change:labels", this.render, this);
			this.listenTo(this.collection, 'add', this.addOne);
			this.listenTo(this.collection, 'reset', this.render);
			this.render();
		},

		render: function(){
			this.defaultLabels = JSON.parse(localStorage.getItem("labels")).map(function(val){return {label: val};});
			this.answerFields = this.defaultLabels.length ? this.defaultLabels : [{label: ""}];

			// render editor view
			this.$el.html(this.editorTemplate({answers: this.answerFields}));

			// render sidebar view
			var sidebar = new SidebarView({view: this.view, collection: this.collection});
			this.$el.find("#sidebar").html(sidebar.el);

			// populate with cards
			this.addAll();
			return this;
		},

		// Add a single card item to the list by creating a view for it, and
		addOne: function(card) {
			var view = new CardView({model: card, view: this.view});
			this.$("#cardset").append(view.render().el);
		},

		// Add all items in the collection at once.
		addAll: function(){
			this.collection.each(this.addOne, this);
		},

		newAnswer: function(e){
			if (e.type === "click" || e.keyCode === 9) {
				this.answerFields.push({label: ""});
				this.render();
			}
		},

		removeAnswer: function(e){
			$(e.target).parent().remove();
		},

		// If you hit return in the main input field, create new **Card** model,
		// persisting it to *localStorage*.
		createOnEnter: function(e) {
			if (e.type !== "click" && e.keyCode !== 13) return;

			var $card = $("#new-card");
			var queryEl = $card.find("[name='query']");
			var answersEl = $card.find(".answers");
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

			if (!query || !answers) return; // return error if required fields are missing

			this.collection.create({query: query, answers: answers}); // save new card

			this.render(); // reset form
		},

	});

	return EditorView;
});