var app = app || {};
app.sips = app.sips || {};
app.sips.gnav = function(c) {
  /**
   * @param rc {Sammy.EventContext}
   * @param callback {function}
   */
  this.render = function(c, callback) {
    $.template('overview-gnav', $('#tpl-overview-gnav'));
    c.content = $($.tmpl('overview-gnav', {}));
    callback();
  };
};