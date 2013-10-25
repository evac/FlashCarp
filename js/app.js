define(function(require){
	"use strict";

	var $ = require('jquery'),
			_ = require('underscore'),
			Backbone = require('backbone'),
			Router = require('router');

	var initialize = function(){
		var router = new Router();
		Backbone.history.start();
	};

	return {initialize: initialize};
});