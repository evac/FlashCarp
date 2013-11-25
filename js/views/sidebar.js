define(function(require){
	"use strict";

	var $ = require('jquery'),
			_ = require('underscore'),
			Backbone = require('backbone'),
			Handlebars = require('handlebars');

	var SidebarView = Backbone.View.extend({

		reviewSidebar: Handlebars.compile($("#review-sidebar-template").html()),
		editorSidebar: Handlebars.compile($("#editor-sidebar-template").html()),

		events: {
			"click .clear-set": "clearAll",
			"keypress .default": "addDefaultLabel",
			"click .add-default": "addDefaultLabel",
			"click #default-labels .delete": "deleteLabel",
		},

		initialize: function(options){
			this.view = options.view;
			this.labels = JSON.parse(localStorage.getItem("labels")) || [];
			this.render();
		},

		render: function() {
			if (this.view === "editor"){
				this.$el.html(this.editorSidebar({labels: this.labels}));
			} else {
				this.$el.html(this.reviewSidebar());
			}

			return this;
		},

		// Clear all cards
		clearAll: function(){
			var card;
			while (card = this.collection.first()) {
				card.destroy();
			}
		},

		addDefaultLabel: function(e){
			if (e.type !== "click" && e.keyCode !== 13) return;

			var label = this.$el.find(".default").val();

			if (label && this.labels.indexOf(label) === -1) {
				this.labels.push(label);
				localStorage.setItem("labels", JSON.stringify(this.labels));
				this.collection.forEach(function(model) {
					model.addLabel(this.label);
				}, {label: label});

				this.render();
				Backbone.Events.trigger("change:labels");
			}
		},

		deleteLabel: function(e) {
			var label = $(e.currentTarget).data("label").toString();

			this.collection.forEach(function(model) {
				model.removeLabel(this.label);
			}, {label: label});

			this.labels = _.without(this.labels, label);
			localStorage.setItem("labels", JSON.stringify(this.labels));

			this.render();
			Backbone.Events.trigger("change:labels");
		}


	});

	return SidebarView;

});