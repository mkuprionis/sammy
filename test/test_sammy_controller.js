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
  app = {};
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

    this.get('#/sips', function(rc){
      var content = $($.tmpl('overview', {}));

      rc.partials = {};

      // hm, would I add additional data to rc or pass as separate param
      async(
        rc,
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
     * @param rc {Sammy.RenderContext}
     * @param callback {function}
     */
    this.render = function(rc, callback) {
      $.template('overview-toolbar', $('#tpl-overview-toolbar'));
      rc.partials[this.name] = $($.tmpl('overview-toolbar', {}));
      callback();
    };
  };

  app.overview.gnav = function(c) {
    /**
     * @param rc {Sammy.RenderContext}
     * @param callback {function}
     */
    this.render = function(rc, callback) {
      $.template('overview-gnav', $('#tpl-overview-gnav'));
      rc.partials[this.name] = $($.tmpl('overview-gnav', {}));
      callback();
    };
  };

  app.overview.lnav = function() {
    /**
     * @param rc {Sammy.RenderContext}
     * @param callback {function}
     */
    this.render = function(rc, callback) {
      var content,
          lnav = this;

      $.template('overview-lnav', $('#tpl-overview-lnav'));
      content = $($.tmpl('overview-lnav', {}));

      content.find('li').click(function(){
        lnav.trigger('localNavSelected');
      });

      rc.partials[this.name] = content;
      callback();
    };
  };

  app.overview.context = function() {
    /**
     * @param rc {Sammy.RenderContext}
     * @param callback {function}
     */
    this.render = function(rc, callback) {
      $.template('widget-context', $('#tpl-widget-context'));
      rc.partials[this.name] = $($.tmpl('widget-context', {}));
      callback();
    };
  };

  app.details.DetailsController = function() {
    var toolbar = this.createComponent('toolbar', app.details.toolbar);
    var extended = this.createComponent('extended', app.details.extended);
    var context = this.createComponent('context', app.details.context);

    $.template('details', $('#tpl-details'));

    /**
     * @param r {Sammy.RenderContext}
     */
    this.get('#/sips/details', function(rc){
      var content = $($.tmpl('details', {}));

      rc.partials = {};

      // hm, would I add additional data to rc or pass as separate param
      async(
        rc,
        [toolbar, 'render'],
        [extended, 'render'],
        [context, 'render'],
        function(rc) {
          content.find('.details-toolbar').replaceWith(rc.partials[toolbar.name]);
          content.find('.extended').replaceWith(rc.partials[extended.name]);
          content.find('.context').replaceWith(rc.partials[context.name]);
          rc.swap(content);
        }
      );
    });
  };

  app.details.toolbar = function() {
    /**
     * @param rc {Sammy.RenderContext}
     * @param callback {function}
     */
    this.render = function(rc, callback) {
      $.template('details-toolbar', $('#tpl-details-toolbar'));
      rc.partials[this.name] = $($.tmpl('details-toolbar', {}));
      callback();
    };
  };

  app.details.context = function() {
    /**
     * @param rc {Sammy.RenderContext}
     * @param callback {function}
     */
    this.render = function(rc, callback) {
      $.template('widget-context', $('#tpl-widget-context'));
      rc.partials[this.name] = $($.tmpl('widget-context', {}));
      callback();
    };
  };

  app.details.extended = function() {
    /**
     * @param rc {Sammy.RenderContext}
     * @param callback {function}
     */
    this.render = function(rc, callback) {
      $.template('details-extended', $('#tpl-details-extended'));
      rc.partials[this.name] = $($.tmpl('details-extended', {}));
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


  /**
   * Takes in any number of functions to be executed async/paralelly.
   * For instance, function needs to fetch data and fetch template.
   * Or it needs its components to fetch their templates and data.
   *
   * Each function gets
   *  - RenderContext passed as param
   *  - callback which it needs to execute when done
   *
   * Function is expected to modify context - that's the way to pass content.
   *
   * Last argument has to be callback that is executed after all functions finish.
   *
   * @param arguments[0] {Sammy.RenderContext}
   * @param arguments[1..length-2] {function} functions to execute
   * @param arguments[length-1] {function} callback
   */
  function async() {
    var args = Array.prototype.slice.call(arguments),
        context = args.shift(),
        callback = args.pop(),
        functions = args,
        completed = 0;

    if( functions.length === 0) {
      callback(context);
    }

    for(var i=0; i < functions.length; i++) {
      // hacky hack, need to rewrite properly
      // @TODO rewrite. If render is put into Component.prototype, these hack should not be needed
      // Maybe helper could be used
      functions[i][0][functions[i][1]].apply(functions[i][0], [context, function() {
        completed++;
        if(completed === functions.length) {
          callback(context);
        }
      }]);
    }
  };
});