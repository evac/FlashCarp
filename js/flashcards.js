// Load the application once the DOM is ready, using `jQuery.ready`:
$(function() {



	/* MODELS
	**********************************************/

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

		active: function(arg){
			var toggle = this.get("active");
			if (toggle) {
				var val = !toggle;
				this.set("active", val);
			} else {
				this.set("active", arg);
			}
		},

	});


	// The collection of cards is backed by *localStorage* instead of a remote
	// server.
	var CardSet = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Card,

		// Save all of the card items under the 'cards' namespace.
		localStorage: new Backbone.LocalStorage("cards"),

	});


	// Create our global collection of **Cards**.
	var Cards = new CardSet();


	/* CARD VIEW
	**********************************************/

	var CardView = Backbone.View.extend({

		tagName: "li",

		template: Handlebars.compile($('#card-template').html()),
		qatemplate: Handlebars.compile($('#qa-template').html()),
		answerTemplate: Handlebars.compile($('#fields-template').html()),

		// The DOM events specific to an item.
		events: {
			"click .edit": "edit",
			"click .save": "close",
			"click a.destroy": "clear",
			"keydown .answers .answer:last-child input[name='answer']": "newAnswer",
			"click .front .title": "reveal",
			"click .main": "hide",
		},

		// listen for changes to model 
		initialize: function(options) {
			this.view = options.view;
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'change:active', this.active);
			this.listenTo(this.model, 'destroy', this.remove);
		},

		// Re-render the querys of the card item based on editor or review mode.
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
			this.back = this.$('.back');
			return this;
		},

		// Switch this view into `"editing"` mode, displaying the input field.
		edit: function() {
			this.$el.addClass("editing");
		},

		newAnswer: function(e) {
			if (e.keyCode == 9) {
				var inputs = this.answerTemplate();
				this.answers.append(inputs);
			}
		},

		// Close the `"editing"` mode, saving changes to the card.
		close: function(e) {
			var query = this.query.val();
			var answerList = this.answers.children();
			var answers = [];

			answerList.each(function(i) {
				label = $(this).children("[name='label']").val();
				answer = $(this).children("[name='answer']").val();
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
				this.$el.removeClass("editing");
			}
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
			this.back.children(".title").text(label + ": ");
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



	/* EDITOR VIEW 
	**********************************************/

	var AppEditor = Backbone.View.extend({

		className: "app",

		template: Handlebars.compile($('#app-template').html()),
		answerTemplate: Handlebars.compile($('#fields-template').html()),

		events: {
			"keypress #new-card": "createOnEnter",
			"click #delete-set": "clearAll",
			"click .remove-answer": "removeAnswer",
			"keydown .answers .answer:last-child [name='answer']": "newAnswer",
			"click #review-set": "reviewSet",
		},

		initialize: function(options) {
			$("#app").html(this.el);
			this.view = options.view;
			this.listenTo(Cards, 'add', this.addOne);
			this.render();
			this.addAll();
		},

		render: function() {
			this.$el.html(this.template());
			this.$card = $("#new-card");
			return this;
		},

		reviewSet: function() {
			app.navigate("review", {trigger: true});
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
				var inputs = this.answerTemplate();
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
				label = $(this).children("[name='label']").val();
				answer = $(this).children("[name='answer']").val();
				if (label || answer) {
					answers.push({label: label, answer: answer});
				} else {
					$(this).remove();
				}
			});

			if (!query || !answers) return;

			Cards.create({query: query, answers: answers});

			// Reset form
			queryEl.val("")
			answersEl.html(this.answerTemplate());
		},

		// Clear all cards
		clearAll: function() {
			var card;
			while (card = Cards.first()) {
				card.destroy();
			}
		},

	});


	/* REVIEW VIEW
	**********************************************/

	var AppReview = Backbone.View.extend({

		className: "review",

		template: Handlebars.compile($('#review-template').html()),

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
			app.navigate("", {trigger: true});
		},


	});


	/* ROUTER
	**********************************************/

	var app = new(Backbone.Router.extend({
		routes: {
			"": "index",
			"review": "review",
		},

		initialize: function(){
			Cards.fetch();
		},

		index: function() {
			this.loadView(new AppEditor({view: "index"}));
		},

		review: function() {
			this.loadView(new AppReview({view: "review"}));
		},

		loadView: function(view){
			if (this.view) {this.view.remove();}
			this.view = view;
		}

	}))();


	Backbone.history.start();

});