var app = app || {};
app.sips = app.sips || {};
app.sips.gnav = function(c) {
  /**
   * @param rc {Sammy.EventContext}
   * @param callback {function}
   */
  this.render = function(c, callback) {
    var context = c;
    $.template('sips-gnav', $('#tpl-sips-gnav'));
    context.content = $($.tmpl('sips-gnav', {items: ['Item 1', 'Item 2']}, {context: context}));
    context.content.find('li').click(function(){
      context.trigger('gnav click', $(this).tmplItem());
    });
    callback();
  };
};