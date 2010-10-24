var app = app || {};
app.details = app.details || {};
app.details.calendar = function() {

  this.get(/.*\.calendar/, function() {
    this.app.log('rendering calendar');
  });

  /**
   * @param c {Sammy.EventContext}
   * @param callback {function}
   */
  this.render = function(c, callback) {
    $.template('details-extended', $('#tpl-details-extended'));
    c.content = $($.tmpl('details-extended', {}));
    callback();
  };
};