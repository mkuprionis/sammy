var app = app || {};
app.sips = app.sips || {};
app.sips.lnav = function() {
  /**
   * @param c {Sammy.EventContext}
   * @param callback {function}
   */
  this.render = function(c, callback) {
    var context = c;

    $.template('sips-lnav', $('#tpl-sips-lnav'));
    c.content = $($.tmpl('sips-lnav', {items: {123: 'Item 1', 456: 'Item 2'}}, {context: context}));

    c.content.find('li').click(function(){
      context.trigger('lnav click', {item: $(this).tmplItem(), context: context, type: 'folder', id: 1}); // or somehow $(this).data('type');
    });
    callback();
  };
};