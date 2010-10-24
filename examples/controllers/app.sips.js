var app = app || {};
app.sips = app.sips || {};
app.sips.controller = function() {
  this.createComponent('details', app.details.DetailsController);

  var toolbar = this.createComponent('toolbar', app.sips.toolbar);
  var gnav = this.createComponent('gnav', app.sips.gnav);
  var lnav = this.createComponent('lnav', app.sips.lnav);
  var context = this.createComponent('context', app.widget.context);

  $.template('overview', $('#tpl-overview'));

  this.get('#/sips', function(c){
    var content = $($.tmpl('overview', {}));

    c.renderAsync(
      [toolbar, 'render'],
      [gnav, 'render'],
      [lnav, 'render'],
      [context, 'render'],
      function(rc) {
        content.find('.overview-toolbar').replaceWith(rc.partials[toolbar.name]);
        content.find('.gnav').replaceWith(rc.partials[gnav.name]);
        content.find('.lnav').replaceWith(rc.partials[lnav.name]);
        content.find('.context').replaceWith(rc.partials[context.name]);
        rc.swap(content);
      }
    );
  });

  lnav.bind('localNavSelected', function(e) {
    // context.render(e);
    // or
    // context.trigger('change', e);
    this.app.log('Event: localNavSelected');
  });

};