var app = app || {};
app.details = app.details || {};
app.details.controller = function() {
  var toolbar = this.createComponent('toolbar', app.details.toolbar);
  var users = this.createComponent('users', app.details.users);
  var calendar = this.createComponent('calendar', app.details.calendar);
  var context = this.createComponent('context', app.widget.context);

  $.template('details', $('#tpl-details'));

  var content = $($.tmpl('details', {}));

  this.around(function(callback){
    var eventContext = this;
    // hm, would I add additional data to rc or pass as separate param
    eventContext.renderAsync(
      [toolbar, 'render'],
      [context, 'render'],
      function(eventContext) {
        content.find('.details-toolbar').replaceWith(eventContext.partials[toolbar.name]);
        content.find('.context').replaceWith(eventContext.partials[context.name]);
        eventContext.swap(content);
      }
    );

    // this := EventContext
    // should work, don't get why not
    // Idea is to that details controller knows that any route will change
    // only right panel (suppose so).
    // So it renders other panels/components itself,
    // gets route from component that handles it and puts everything into content.
    eventContext.send(callback).then(function(renderedRoute) {
      content.find('.extended').replaceWith(renderedRoute);
    });
  });
};