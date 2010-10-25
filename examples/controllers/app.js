/**
 * @TODO couldn't get sammy's templates to work. And to use jquery's templates directly seems nicer.
 */
var app = app || {};
$(function(){

  app.controller = new Sammy.Application(function() {
    this.debug = true;
    this.raise_errors = false;
    this.element_selector = '#main';

    var sips = this.createComponent('sips', app.sips.controller);
    // this.createComponent('users', app.users.controller);
    // ...

    sips.bind('gnav click', function(e, data) {
      this.log('caught gnav click in app:', e, data);
    });
  }).run('#/sips');

});