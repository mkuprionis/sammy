var app = app || {};
app.details = app.details || {};
app.details.controller = function() {
  var toolbar = this.createComponent('toolbar', app.details.toolbar);
  var users = this.createComponent('users', app.details.users);
  var calendar = this.createComponent('calendar', app.details.calendar);
  var context = this.createComponent('context', app.widget.context);

  $.template('details', $('#tpl-details'));

  var content = $($.tmpl('details', {}));
  var isRendered = false;

  // Suppose we cache this content somehow
  // so no need to rerender when users clicks other extended detail
  this.before(function(){
    var eventContext = this;

    if(!isRendered) {
      // hm, would I add additional data to rc or pass as separate param
      eventContext.renderAsync(
        [toolbar, 'render'],
        [context, 'render'],
        function(eventContext) {
          content.find('.details-toolbar').replaceWith(eventContext.partials[toolbar.name]);
          content.find('.context').replaceWith(eventContext.partials[context.name]);
          isRendered = true;
        }
      );
    }
    // content.find('.extended').(show loading)
  });

  // users.bind('event-context-after', function(e) {
  // cannot bind to event-context-after
  // event though route handler has teturned, route handling may still be in progress - e.g. ajax call
  users.bind('event-context-after', function(e) {
    // check console: event-context-after is trigerred before rendering is done

    content.find('.extended').replaceWith(this.content);
    this.log('got users, adding to content');
    this.swap(content); // better would be this.swap();
  });

  calendar.bind('rendering done', function(e) {
    var context = this;
    content.find('.extended').hide(
      'slow',
      function(){
        $(this).replaceWith(context.content);
      }
    );
  });
};