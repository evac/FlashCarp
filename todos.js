// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){


  // var Answer = Backbone.Model.extend({

  //   // Default attributes for the card item.
  //   defaults: function() {
  //     return {
  //       label: "",
  //       data: ""
  //     };
  //   },

  //   // Ensure that each card created has `query`.
  //   initialize: function() {
  //     if (!this.get("query")) {
  //       this.set(this.defaults);
  //     }
  //   },

  //   // Toggle the `done` state of this card item.
  //   addAnswer: function(data) {
  //     this.save({answers: this.answers.append({label: data.label, data: data.data})});
  //   },

  // });


  var Card = Backbone.Model.extend({

    // Default attributes for the card item.
    defaults: function() {
      return {
        query: "",
        order: Cards.nextOrder(),
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
      this.save({answers: this.answers.append({label: data.label, answer: data.answer})});
    },

    // Toggle the `done` state of this card item.
    toggle: function() {
      this.save({done: !this.get("done")});
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
      return this.filter(function(card){ return card.get('done'); });
    },

    // Filter down the list to only card items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

    // We keep the Cards in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Cards are sorted by their original insertion order.
    comparator: function(card) {
      return card.get('order');
    }

  });

  // Create our global collection of **Cards**.
  var Cards = new CardSet;

  var CardView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: Handlebars.compile($('#card-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .edit"  : "edit",
      "click .save"      : "close",
      "click a.destroy" : "clear",
      "keydown .answers .answer:last-child input[name='answer']": "newAnswer"
    },

    // The CardView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Card** and a **CardView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the querys of the card item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.query = this.$('.update[name="query"]');
      this.answers = this.$('.answers');
      return this;
    },

    toggleAnswer: function() {
      this.model;
    },

    toggleCard: function() {
      this.$el.toggleClass("reveal");
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
      this.model.toggle();
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

      answerList.each(function(i){
        label = $(this).children("[name='label']").val();
        answer = $(this).children("[name='answer']").val();
        if (label || answer) {
          answers.push({label: label, answer: answer})
        } else {
          $(this).remove();
        }
      })


      if (query && answers) {
        this.model.save({query: query, answers: answers});
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

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#app"),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-card":  "createOnEnter",
      "click #delete-set": "clearAll",
      "click .remove-answer": "removeAnswer",
      "keydown .answers .answer:last-child input[name='answer']": "newAnswer",
    },

    // At initialization we bind to the relevant events on the `Cards`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting cards that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new-card");
      this.query = this.input.children("[name='query']");
      this.answers = this.input.children(".answers");
      this.options = $('.options')

      this.listenTo(Cards, 'add', this.addOne);
      this.listenTo(Cards, 'all', this.render);

      Cards.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      var done = Cards.done().length;
      var remaining = Cards.remaining().length;

      if (Cards.length) {
        this.options.show();
      } else {
        this.options.hide();
      }
    },

    // Add a single card item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(card) {
      var view = new CardView({model: card});
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
        this.answers.append(inputs);
      }
    },


    removeAnswer: function(e) {
      $(e.target).parent().remove()
    },

    // If you hit return in the main input field, create new **Card** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;

      var query = this.query.val();
      var answerList = this.answers.children();
      var answers = [];

      answerList.each(function(i){
        label = $(this).children("[name='label']").val();
        answer = $(this).children("[name='answer']").val();
        if (label || answer) {
          answers.push({label: label, answer: answer})
        }
      })

      if (!query || !answers) return;

      Cards.create({query: query, answers: answers});
      this.input.find('input').val('');
    },

    // Clear all done card items, destroying their models.
    clearAll: function() {
      // Cards.each(function (card) { card.destroy(); });
      var card;
      while (card = Cards.first()) {
        card.destroy();
      }
    },

  });

  

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});
