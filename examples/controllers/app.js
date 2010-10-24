/**
 * @TODO couldn't get sammy's templates to work. And to use jquery's templates directly seems nicer.
 * Maybe something can be done to better use Sammy's event api
 * @TODO action should somehow return DOM element. For instance, Details return DOM, and Overview
 * swaps its own view with details.
 */
var app = app || {};
$(function(){

  app.controller = new Sammy.Application(function() {
    this.debug = true;
    this.raise_errors = true;
    this.element_selector = '#main';

    this.createComponent('sips', app.sips.controller);
    // this.createComponent('users', app.users.controller);
    // ...
  }).run('#/sips');

});