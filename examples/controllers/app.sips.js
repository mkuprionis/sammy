var app = app || {};
app.sips = app.sips || {};
app.sips.controller = function() {
  this.createComponent('details', app.details.controller);

  var toolbar = this.createComponent('toolbar', app.sips.toolbar);
  var gnav = this.createComponent('gnav', app.sips.gnav);
  var lnav = this.createComponent('lnav', app.sips.lnav);
  var context = this.createComponent('context', app.widget.context);
  var content; // @TODO Here would be useful to have component.$element(), this var would be not needed

  $.template('sips', $('#tpl-sips'));

  gnav.bind('gnav click', function(e, data) {
    this.log('caught gnav click in sips controller:', e, data);
  });
  
  lnav.bind('lnav click', function(e, data) {
    this.app.log('lnav click: ', e, data);
    
    //EventContext for context widget
    var contextInfoContext = new context.context_prototype(
                                                      context, // component
                                                      'get',   // we ask to render, so 'get'
                                                      e.type,  // event name goes for path
                                                      data
                                                    );
    
    context.render(contextInfoContext, function() {
      content.find('.context').replaceWith(contextInfoContext.content);
    });
  });

  this.get('#/sips', function(c){
    content = $($.tmpl('sips', {}));

    c.renderAsync(
      [toolbar, 'render'],
      [gnav, 'render'],
      [lnav, 'render'],
      [context, 'render'],
      function(rc) {
        content.find('.sips-toolbar').replaceWith(rc.partials[toolbar.name]);
        content.find('.gnav').replaceWith(rc.partials[gnav.name]);
        content.find('.lnav').replaceWith(rc.partials[lnav.name]);
        content.find('.context').replaceWith(rc.partials[context.name]);
        rc.swap(content);
      }
    );
  });

};