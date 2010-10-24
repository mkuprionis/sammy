var app = app || {};
app.widget = app.widget || {};
app.widget.context = function() {
  /**
   * @param c {Sammy.EventContext}
   * @param callback {function}
   */
  this.render = function(c, callback) {
    $.template('widget-context', $('#tpl-widget-context'));
    var data = {};

    if( c.params && c.params.type && c.params.type == 'folder') {
      data.name = "Folder Y";
    } else {
      data.name = 'Control X'
    }
    c.content = $($.tmpl('widget-context', data));
    callback();
  };
};