define(function(require){
	"use strict";

	var $ = require('jquery'),
			Backbone = require('backbone'),
			Handlebars = require('handlebars');

	var HeaderView = Backbone.View.extend({

		tagName: "header",

		headerTemplate: Handlebars.compile($('#header-template').html()),
		editorNav: Handlebars.compile($('#editor-nav-template').html()),
		reviewNav: Handlebars.compile($('#review-nav-template').html()),
		demoNav: Handlebars.compile($('#demo-nav-template').html()),

		events: {
			"click #edit-set": "editSet",
			"click #review-set": "reviewSet",
			"click .demo-set": "demoSet",
			"click .dropdown-toggle": "dropdown"
		},

		initialize: function(options) {
			this.view = options.view;
			this.collection = options.collection;
			this.$el.html(this.headerTemplate);
			$("#app").append(this.el);
			this.render();
		},

		render: function() {
			// append header options
			if (this.view === "editor") {
				this.$el.children("menu").append(this.editorNav);
			} else {
				this.$el.children("menu").append(this.reviewNav);
			}

			this.$el.children("menu").append(this.demoNav);

			return this;
		},

		editSet: function() {
			Backbone.history.navigate("", {trigger: true});
		},

		reviewSet: function() {
			Backbone.history.navigate("review", {trigger: true});
		},

		demoSet: function(e) {
			var set = $(e.target).data('set');
			this.collection.fetchDemoSet(set);
			if (this.view === "review") {
				this.randomCard();
			}
			this.$el.find('.dropdown-toggle').removeClass("active");
		},

		dropdown: function(e) {
			var $target = this.$(e.target);
			$target.toggleClass("active");
		}

	});

	return HeaderView;

});