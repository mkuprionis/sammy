/**
 * @TODO render context has to contain component. not sure which and how
 * @TODO couldn't get sammy's templates to work. And to use jquery's templates directly seems nicer.
 * Maybe something can be done to better use Sammy's event api
 * @TODO action should somehow return DOM element. For instance, Details return DOM, and Overview
 * swaps its own view with details.
 * @TODO Maybe renderContext should contain component that started rendering
 * and then component that is currently rendering it (but what about paralell rendering)
 * Then it could be possible to call rc.swap which would swap original component's view
 *
 * Routes need more thought, for sure
 */

$(function(){
  var app = {};
  app.overview = {};
  app.widgets = {};
  app.details = {};
  
  app.overview.OverviewController = function() {
    this.createComponent('details', app.details.DetailsController);

    var toolbar = this.createComponent('toolbar', app.overview.toolbar);
    var gnav = this.createComponent('gnav', app.overview.gnav);
    var lnav = this.createComponent('lnav', app.overview.lnav);
    var context = this.createComponent('context', app.overview.context);

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

  app.overview.toolbar = function(c) {
    /**
     * @param c {Sammy.EventContext}
     * @param callback {function}
     */
    this.render = function(c, callback) {
      $.template('overview-toolbar', $('#tpl-overview-toolbar'));
      c.content = $($.tmpl('overview-toolbar', {}));
      callback();
    };
  };

  app.overview.gnav = function(c) {
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

  app.overview.lnav = function() {
    /**
     * @param c {Sammy.EventContext}
     * @param callback {function}
     */
    this.render = function(c, callback) {
      var content,
          lnav = this;

      $.template('overview-lnav', $('#tpl-overview-lnav'));
      c.content = $($.tmpl('overview-lnav', {}));

      c.content.find('li').click(function(){
        lnav.trigger('localNavSelected');
      });
      callback();
    };
  };

  app.overview.context = function() {
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

  app.details.DetailsController = function() {
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

  app.details.toolbar = function() {
    /**
     * @param c {Sammy.EventContext}
     * @param callback {function}
     */
    this.render = function(c, callback) {
      $.template('details-toolbar', $('#tpl-details-toolbar'));
      c.content = $($.tmpl('details-toolbar', {}));
      callback();
    };
  };

  app.details.context = function() {
    /**
     * @param c {Sammy.EventContext}
     * @param callback {function}
     */
    this.render = function(c, callback) {
      $.template('widget-context', $('#tpl-widget-context'));
      c.content = $($.tmpl('widget-context', {}));
      callback();
    };
  };

  app.details.extended = function() {
    /**
     * @param c {Sammy.EventContext}
     * @param callback {function}
     */
    this.render = function(c, callback) {
      $.template('details-extended', $('#tpl-details-extended'));
      c.content = $($.tmpl('details-extended', {}));
      callback();
    };
  };

  app.appController = new Sammy.Application(function() {
    this.debug = true;
    this.raise_errors = true;
    this.template_engine = 'tmpl';
    this.element_selector = '#main';
    this.use('Tmpl');

    this.createComponent('overview', app.overview.OverviewController);
  }).run('#/sips');


  
});