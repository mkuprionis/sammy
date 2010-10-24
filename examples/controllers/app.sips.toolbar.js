var app = app || {};
app.sips = app.sips || {};
app.sips.toolbar = function(c) {
  /**
   * @param c {Sammy.EventContext}
   * @param callback {function}
   */
  this.render = function(c, callback) {
    $.template('sips-toolbar', $('#tpl-sips-toolbar'));
    c.content = $($.tmpl('sips-toolbar', {}));
    callback();
  };
};