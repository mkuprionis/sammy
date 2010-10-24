var app = app || {};
app.details = app.details || {};
app.details.controller = function() {
  var toolbar = this.createComponent('toolbar', app.details.toolbar);
  var extended = this.createComponent('extended', app.details.extended);
  var context = this.createComponent('context', app.details.context);

  $.template('details', $('#tpl-details'));

  /**
   * @param r {Sammy.EventContext}
   */
  this.get('#/sips/details', function(c){
    var content = $($.tmpl('details', {}));

    // hm, would I add additional data to rc or pass as separate param
    c.renderAsync(
      [toolbar, 'render'],
      [extended, 'render'],
      [context, 'render'],
      function(c) {
        content.find('.details-toolbar').replaceWith(c.partials[toolbar.name]);
        content.find('.extended').replaceWith(c.partials[extended.name]);
        content.find('.context').replaceWith(c.partials[context.name]);
        c.swap(content);
      }
    );
  });
};