// Load the application once the DOM is ready, using `jQuery.ready`:
$(function() {

	var Card = Backbone.Model.extend({

		// Default attributes for the card item.
		defaults: function() {
			return {
				query: "",
				// order: Cards.nextOrder(),
				done: false,
				answers: []
			};
		},

		// Ensure that each card created has `query`.
		initialize: function() {
			if (!this.get("query")) {
				this.set(this.defaults);
			}
		},

		// Toggle the `done` state of this card item.
		addAnswer: function(data) {
			this.save({
				answers: this.answers.append({
					label: data.label,
					answer: data.answer
				})
			});
		},

		// Toggle the `done` state of this card item.
		toggle: function() {
			this.save({
				done: !this.get("done")
			});
		}

	});


	// The collection of cards is backed by *localStorage* instead of a remote
	// server.
	var CardSet = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Card,

		// Save all of the card items under the `"cards"` namespace.
		localStorage: new Backbone.LocalStorage("cards"),

		// Filter down the list of all card items that are finished.
		done: function() {
			return this.filter(function(card) {
				return card.get('done');
			});
		},

		// Filter down the list to only card items that are still not finished.
		remaining: function() {
			return this.without.apply(this, this.done());
		},

		// We keep the Cards in sequential order, despite being saved by unordered
		// GUID in the database. This generates the next order number for new items.
		// nextOrder: function() {
		// 	if (!this.length) return 1;
		// 	return this.last().get('order') + 1;
		// },

		// Cards are sorted by their original insertion order.
		// comparator: function(card) {
		// 	return card.get('order');
		// }

	});

	// Create our global collection of **Cards**.
	var Cards = new CardSet();


	var CardView = Backbone.View.extend({

		//... is a list tag.
		tagName: "li",

		// Cache the template function for a single item.
		template: Handlebars.compile($('#card-template').html()),
		qatemplate: Handlebars.compile($('#qa-template').html()),

		// The DOM events specific to an item.
		events: {
			"click .edit": "edit",
			"click .save": "close",
			"click a.destroy": "clear",
			"keydown .answers .answer:last-child input[name='answer']": "newAnswer"
		},

		// The CardView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Card** and a **CardView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function(options) {
			this.view = options.view
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},

		// Re-render the querys of the card item.
		render: function() {
			var template;

			if (this.view == "review") {
				template = this.qatemplate(this.model.toJSON());
			} else {
				template = this.template(this.model.toJSON());
			}

			this.$el.html(template);
			this.query = this.$('.update[name="query"]');
			this.answers = this.$('.answers');
			return this;
		},

		// Switch this view into `"editing"` mode, displaying the input field.
		edit: function() {
			this.$el.addClass("editing");
		},

		answerTemplate: Handlebars.compile($('#bits-template').html()),

		newAnswer: function(e) {
			if (e.keyCode == 9) {
				var inputs = this.answerTemplate();
				this.answers.append(inputs);
			}
		},

		// Close the `"editing"` mode, saving changes to the card.
		close: function() {
			var query = this.query.val();
			var answerList = this.answers.children();
			var answers = [];

			answerList.each(function(i) {
				label = $(this).children("[name='label']").val();
				answer = $(this).children("[name='answer']").val();
				if (label || answer) {
					answers.push({
						label: label,
						answer: answer
					});
				} else {
					$(this).remove();
				}
			});


			if (query && answers) {
				this.model.save({
					query: query,
					answers: answers
				});
				this.$el.removeClass("editing");
			}
		},

		// Remove the item, destroy the model.
		clear: function() {
			this.model.destroy();
		}
	});

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	var AppView = Backbone.View.extend({

		className: "app",

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			"keypress #new-card": "createOnEnter",
			"click #delete-set": "clearAll",
			"click .remove-answer": "removeAnswer",
			"keydown .answers .answer:last-child input[name='answer']": "newAnswer",
			"click #review-set": "reviewSet",
		},

		// At initialization we bind to the relevant events on the `Cards`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting cards that might be saved in *localStorage*.
		initialize: function(options) {
			$("#app").html(this.el);
			this.view = options.view;
			this.listenTo(Cards, 'add', this.addOne);
			this.render();
			this.addAll();
		},

		template: Handlebars.compile($('#app-template').html()),

		render: function() {
			this.$el.html(this.template());
			this.$card = $("#new-card");
			return this;
		},

		reviewSet: function() {
			app.navigate("review", {
				trigger: true
			});
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

		answerTemplate: Handlebars.compile($('#bits-template').html()),

		newAnswer: function(e) {
			if (e.keyCode == 9) {
				var inputs = this.answerTemplate();
				this.$card.children(".answers").append(inputs);
			}
		},


		removeAnswer: function(e) {
			$(e.target).parent().remove();
		},

		// If you hit return in the main input field, create new **Card** model,
		// persisting it to *localStorage*.
		createOnEnter: function(e) {
			if (e.keyCode != 13) return;

			var queryEl = this.$card.children("[name='query']");
			var answersEl = this.$card.children(".answers");
			var query = queryEl.val();
			var answerList = answersEl.children();
			var answers = [];

			answerList.each(function(i) {
				label = $(this).children("[name='label']").val();
				answer = $(this).children("[name='answer']").val();
				if (label || answer) {
					answers.push({
						label: label,
						answer: answer
					});
				}
			});

			if (!query || !answers) return;

			Cards.create({
				query: query,
				answers: answers
			});

			// Reset form
			this.resetForm();
		},

		resetForm: function() {
			this.$card.children("input").val("");
			this.$card.children(".answers").html(this.answerTemplate());
		},

		// Clear all done card items, destroying their models.
		clearAll: function() {
			// Cards.each(function (card) { card.destroy(); });
			var card;
			while (card == Cards.first()) {
				card.destroy();
			}
		},

	});



	// Our overall **AppView** is the top-level piece of UI.
	var AppReview = Backbone.View.extend({

		className: "review",

		template: Handlebars.compile($('#review-template').html()),

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			"click #edit-set": "editSet",
		},

		initialize: function(options) {
			this.view = options.view;
			$("#app").html(this.el);
			this.render();
			this.addAll();
		},

		// Re-render the querys of the card item.
		render: function() {
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

		toggleCard: function() {
			this.$el.toggleClass("reveal");
		},

		editSet: function() {
			app.navigate("", {
				trigger: true
			});
		},


	});

	var app = new(Backbone.Router.extend({
		routes: {
			"": "index",
			"review": "review",
		},

		initialize: function(){
			Cards.fetch();

			if (Cards.first()) {
				this.navigate("review", {
					trigger: true
				});
			} else {
				this.navigate("", {
					trigger: true
				});
			}
		},

		index: function() {
			this.loadView(new AppView({view: "index"}));
		},

		review: function() {
			this.loadView(new AppReview({view: "review"}));
		},

		loadView: function(view){
			if (this.view) {this.view.remove();}
			this.view = view;
		}

	}))();


	// Review set on default if there is saved set, else start by creating a set

	Backbone.history.start();

});