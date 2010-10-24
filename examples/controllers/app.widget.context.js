var app = app || {};
app.widget = app.widget || {};
app.widget.context = function() {
  /**
   * @param rc {Sammy.EventContext}
   * @param callback {function}
   */
  this.render = function(c, callback) {
    $.template('widget-context', $('#tpl-widget-context'));
    c.content = $($.tmpl('widget-context', {}));
    callback();
  };
};