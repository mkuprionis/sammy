var app = app || {};
app.sips = app.sips || {};
app.sips.toolbar = function(c) {
  /**
   * @param c {Sammy.EventContext}
   * @param callback {function}
   */
  this.render = function(c, callback) {
    $.template('overview-toolbar', $('#tpl-overview-toolbar'));
    c.content = $($.tmpl('overview-toolbar', {}));
    callback();
  };
};