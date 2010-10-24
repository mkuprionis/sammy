var app = app || {};
app.details = app.details || {};
app.details.toolbar = function() {
  /**
   * @param c {Sammy.EventContext}
   * @param callback {function}
   */
  this.render = function(c, callback) {
    $.template('details-toolbar', $('#tpl-details-toolbar'));
    c.content = $($.tmpl('details-toolbar', {}));
    callback();
  };
};