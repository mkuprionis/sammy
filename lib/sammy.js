// name: sammy
// version: 0.6.2

(function($, window) {

  var Sammy,
      PATH_REPLACER = "([^\/]+)",
      PATH_NAME_MATCHER = /:([\w\d]+)/g,
      QUERY_STRING_MATCHER = /\?([^#]*)$/,
      // mainly for making `arguments` an Array
      _makeArray = function(nonarray) { return Array.prototype.slice.call(nonarray); },
      // borrowed from jQuery
      _isFunction = function( obj ) { return Object.prototype.toString.call(obj) === "[object Function]"; },
      _isArray = function( obj ) { return Object.prototype.toString.call(obj) === "[object Array]"; },
      _decode = decodeURIComponent,
      _escapeHTML = function(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      },
      _routeWrapper = function(verb) {
        return function(path, callback) { return this.route.apply(this, [verb, path, callback]); };
      },
      _template_cache = {},
      loggers = [];


  // `Sammy` (also aliased as $.sammy) is not only the namespace for a
  // number of prototypes, its also a top level method that allows for easy
  // creation/management of `Sammy.Application` instances. There are a
  // number of different forms for `Sammy()` but each returns an instance
  // of `Sammy.Application`. When a new instance is created using
  // `Sammy` it is added to an Object called `Sammy.apps`. This
  // provides for an easy way to get at existing Sammy applications. Only one
  // instance is allowed per `element_selector` so when calling
  // `Sammy('selector')` multiple times, the first time will create
  // the application and the following times will extend the application
  // already added to that selector.
  //
  // ### Example
  //
  //      // returns the app at #main or a new app
  //      Sammy('#main')
  //
  //      // equivilent to "new Sammy.Application", except appends to apps
  //      Sammy();
  //      Sammy(function() { ... });
  //
  //      // extends the app at '#main' with function.
  //      Sammy('#main', function() { ... });
  //
  Sammy = function() {
    var args = _makeArray(arguments),
        app, selector;
    Sammy.apps = Sammy.apps || {};
    if (args.length === 0 || args[0] && _isFunction(args[0])) { // Sammy()
      return Sammy.apply(Sammy, ['body'].concat(args));
    } else if (typeof (selector = args.shift()) == 'string') { // Sammy('#main')
      app = Sammy.apps[selector] || new Sammy.Application();
      app.element_selector = selector;
      if (args.length > 0) {
        $.each(args, function(i, plugin) {
          app.use(plugin);
        });
      }
      // if the selector changes make sure the refrence in Sammy.apps changes
      if (app.element_selector != selector) {
        delete Sammy.apps[selector];
      }
      Sammy.apps[app.element_selector] = app;
      return app;
    }
  };

  Sammy.VERSION = '0.6.2';

  // Add to the global logger pool. Takes a function that accepts an
  // unknown number of arguments and should print them or send them somewhere
  // The first argument is always a timestamp.
  Sammy.addLogger = function(logger) {
    loggers.push(logger);
  };

  // Sends a log message to each logger listed in the global
  // loggers pool. Can take any number of arguments.
  // Also prefixes the arguments with a timestamp.
  Sammy.log = function()  {
    var args = _makeArray(arguments);
    args.unshift("[" + Date() + "]");
    $.each(loggers, function(i, logger) {
      logger.apply(Sammy, args);
    });
  };

  if (typeof window.console != 'undefined') {
    if (_isFunction(console.log.apply)) {
      Sammy.addLogger(function() {
        window.console.log.apply(console, arguments);
      });
    } else {
      Sammy.addLogger(function() {
        window.console.log(arguments);
      });
    }
  } else if (typeof console != 'undefined') {
    Sammy.addLogger(function() {
      console.log.apply(console, arguments);
    });
  }

  $.extend(Sammy, {
    makeArray: _makeArray,
    isFunction: _isFunction,
    isArray: _isArray
  });

  // Simple JavaScript Inheritance
  // By John Resig http://ejohn.org/
  // MIT Licensed.
  // Inspired by base2 and Prototype
  // @see http://ejohn.org/blog/simple-javascript-inheritance/
  //
  // @example
  // <code>
  // var Person = Class.extend({
  //    init: function(isDancing){
  //      this.dancing = isDancing;
  //    },
  //    dance: function(){
  //      return this.dancing;
  //    }
  //  });
  //  var Ninja = Person.extend({
  //    init: function(){
  //      this._super( false );
  //    },
  //    dance: function(){
  //      // Call the inherited version of dance()
  //      return this._super();
  //    },
  //    swingSword: function(){
  //      return true;
  //    }
  //  });
  //
  //  var p = new Person(true);
  //  p.dance(); // => true
  //
  //  var n = new Ninja();
  //  n.dance(); // => false
  //  n.swingSword(); // => true
  //
  //  // Should all be true
  //  p instanceof Person && p instanceof Class &&
  //  n instanceof Ninja && n instanceof Person && n instanceof Class
  //  </code>
  //
  (function(){

    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    Sammy.Class = function(){};

    // Create a new Class that inherits from this class
    // @method
    // @param prop {object} Map of methods to plug in your class
    // @returns {Sammy.Class}
    Sammy.Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
          // Check if we're overwriting an existing function
          prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function(name, fn){
              return function() {
                var tmp = this._super;

                // Add a new ._super() method that is the same method
                // but on the super-class
                this._super = _super[name];

                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                var ret = fn.apply(this, arguments);
                this._super = tmp;

                return ret;
              };
            })(name, prop[name]) :
            prop[name];
        }

        // The dummy class constructor
        function Class() {
          // All construction is actually done in the init method
          if ( !initializing && this.init )
            this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
      };
  })();

  // Sammy.Object
  (function(){
    // Sammy.Object is the base for all other Sammy classes. It provides some useful
    // functionality, including cloning, iterating, etc.
    // @TODO deal with case when obj is an Array (Crockford said smth about extending Arrays and smth bad afaik)
    // @param obj {object|function}
    // @return {Sammy.Object}
    Sammy.Object = function(obj) { // constructor
      return this.extend(obj);
    };

    Sammy.Object = Sammy.Class.extend({
      init: function(obj) {
        $.extend(this, obj);
      }
    });

    // Escape HTML in string, use in templates to prevent script injection.
    // Also aliased as `h()`
    Sammy.Object.prototype.escapeHTML = _escapeHTML;
    Sammy.Object.prototype.h = _escapeHTML;

    // Returns a copy of the object with Functions removed.
    Sammy.Object.prototype.toHash = function() {
      var json = {};
      $.each(this, function(k,v) {
        if (!_isFunction(v)) {
          json[k] = v;
        }
      });
      return json;
    };

    // Renders a simple HTML version of this Objects attributes.
    // Does not render functions.
    // For example. Given this Sammy.Object:
    //
    //    var s = new Sammy.Object({first_name: 'Sammy', last_name: 'Davis Jr.'});
    //    s.toHTML() //=> '<strong>first_name</strong> Sammy<br /><strong>last_name</strong> Davis Jr.<br />'
    //
    Sammy.Object.prototype.toHTML = function() {
      var display = "";
      $.each(this, function(k, v) {
        if (!_isFunction(v)) {
          display += "<strong>" + k + "</strong> " + v + "<br />";
        }
      });
      return display;
    };

    // Returns an array of keys for this object. If `attributes_only`
    // is true will not return keys that map to a `function()`
    Sammy.Object.prototype.keys = function(attributes_only) {
      var keys = [];
      for (var property in this) {
        if (!_isFunction(this[property]) || !attributes_only) {
          keys.push(property);
        }
      }
      return keys;
    };

    // Checks if the object has a value at `key` and that the value is not empty
    Sammy.Object.prototype.has = function(key) {
      return this[key] && $.trim(this[key].toString()) != '';
    };

    // convenience method to join as many arguments as you want
    // by the first argument - useful for making paths
    Sammy.Object.prototype.join = function() {
      var args = _makeArray(arguments);
      var delimiter = args.shift();
      return args.join(delimiter);
    };

    // Shortcut to Sammy.log
    Sammy.Object.prototype.log = function() {
      Sammy.log.apply(Sammy, arguments);
    };

    // Returns a string representation of this object.
    // if `include_functions` is true, it will also toString() the
    // methods of this object. By default only prints the attributes.
    Sammy.Object.prototype.toString = function(include_functions) {
      var s = [];
      $.each(this, function(k, v) {
        if (!_isFunction(v) || include_functions) {
          s.push('"' + k + '": ' + v.toString());
        }
      });
      return "Sammy.Object: {" + s.join(',') + "}";
    };
  })();


  (function() {
    // The HashLocationProxy is the default location proxy for all Sammy applications.
    // A location proxy is a prototype that conforms to a simple interface. The purpose
    // of a location proxy is to notify the Sammy.Application its bound to when the location
    // or 'external state' changes. The HashLocationProxy considers the state to be
    // changed when the 'hash' (window.location.hash / '#') changes. It does this in two
    // different ways depending on what browser you are using. The newest browsers
    // (IE, Safari > 4, FF >= 3.6) support a 'onhashchange' DOM event, thats fired whenever
    // the location.hash changes. In this situation the HashLocationProxy just binds
    // to this event and delegates it to the application. In the case of older browsers
    // a poller is set up to track changes to the hash. Unlike Sammy 0.3 or earlier,
    // the HashLocationProxy allows the poller to be a global object, eliminating the
    // need for multiple pollers even when thier are multiple apps on the page.
    Sammy.HashLocationProxy = function(app, run_interval_every) {
      this.app = app;
      // set is native to false and start the poller immediately
      this.is_native = false;
      this._startPolling(run_interval_every);
    };

    // bind the proxy events to the current app.
    Sammy.HashLocationProxy.prototype.bind = function() {
      var proxy = this, app = this.app;
      $(window).bind('hashchange.' + this.app.eventNamespace(), function(e, non_native) {
        // if we receive a native hash change event, set the proxy accordingly
        // and stop polling
        if (proxy.is_native === false && !non_native) {
          Sammy.log('native hash change exists, using');
          proxy.is_native = true;
          window.clearInterval(Sammy.HashLocationProxy._interval);
        }
        app.trigger('location-changed');
      });
      if (!Sammy.HashLocationProxy._bindings) {
        Sammy.HashLocationProxy._bindings = 0;
      }
      Sammy.HashLocationProxy._bindings++;
    };

    // unbind the proxy events from the current app
    Sammy.HashLocationProxy.prototype.unbind = function() {
      $(window).unbind('hashchange.' + this.app.eventNamespace());
      Sammy.HashLocationProxy._bindings--;
      if (Sammy.HashLocationProxy._bindings <= 0) {
        window.clearInterval(Sammy.HashLocationProxy._interval);
      }
    };

    // get the current location from the hash.
    Sammy.HashLocationProxy.prototype.getLocation = function() {
     // Bypass the `window.location.hash` attribute.  If a question mark
      // appears in the hash IE6 will strip it and all of the following
      // characters from `window.location.hash`.
      var matches = window.location.toString().match(/^[^#]*(#.+)$/);
      return matches ? matches[1] : '';
    };

    // set the current location to `new_location`
    Sammy.HashLocationProxy.prototype.setLocation = function(new_location) {
      return (window.location = new_location);
    };

    Sammy.HashLocationProxy.prototype._startPolling = function(every) {
      // set up interval
      var proxy = this;
      if (!Sammy.HashLocationProxy._interval) {
        if (!every) { every = 10; }
        var hashCheck = function() {
          var current_location = proxy.getLocation();
          if (!Sammy.HashLocationProxy._last_location ||
            current_location != Sammy.HashLocationProxy._last_location) {
            window.setTimeout(function() {
              $(window).trigger('hashchange', [true]);
            }, 13);
          }
          Sammy.HashLocationProxy._last_location = current_location;
        };
        hashCheck();
        Sammy.HashLocationProxy._interval = window.setInterval(hashCheck, every);
      }
    };
  })();
  // end Sammy.HashLocaltionProxy

  (function(){
    /**
     * @TODO add log method
     */
    Sammy.Component = function(){};
    Sammy.Component = Sammy.Object.extend({
      init: function(component_function, name, app, parentComponent){
        var component = this;
        this.name = name;
        /**
         * @type Sammy.Application
         */
        this.app = app;
        this.parent = parentComponent;
        this.components = {};

        // generate a unique namespace
        this.namespace         = (new Date()).getTime() + '-' + parseInt(Math.random() * 1000, 10);

        // Or, parent's context could be extended.
        // This would mean that if parent uses some plugin, child uses it to.
        // And if child uses smth, parent is not affected.
        // Woudl also result in possibly big prototype/inheritance chain
        this.context_prototype = Sammy.EventContext.extend({
          init: function() {
            // called this way only to pass arguments
            this._super.apply(this, arguments);
          }
        });
        
        // filters that wrap route
        this.arounds = [];
        // filters run before route
        this.befores = [];

        // routes handled by this component
        this.routes = {};
        // routes handled by child components
        this.componentRoutes = {};

        if (_isFunction(component_function)) {
          component_function.apply(this, [this]);
        }
      }
    });


    // A unique event namespace defined per application.
    // All events bound with `bind()` are automatically bound within this space.
    Sammy.Component.prototype.eventNamespace = function() {
      if( this.parent ) {
        return [this.parent.eventNamespace(), [this.name, this.namespace].join('-')].join('.');
      } else {
        return [this.name, this.namespace].join('-');
      }
    };

    // Triggers custom events defined with `bind()`
    //
    // ### Arguments
    //
    // * `name` The name of the event. Automatically prefixed with the `eventNamespace()`
    // * `data` An optional Object that can be passed to the bound callback.
    // * `context` An optional context/Object in which to execute the bound callback.
    //   If no context is supplied a the context is a new `Sammy.EventContext`
    //
    Sammy.Component.prototype.trigger = function(name, data) {
      // Trigger only if app is running
      // @TODO component has some state (active/running, smth else).
      // Check it and trigger if possible
      if( this.app.isRunning()) {
        var eventName,
            e,
            continuePropagation = true;
        if( typeof name == 'string' ) {
          eventName = [this.eventNamespace(), name].join('.');
          e = new Sammy.Event(name, this);
        } else {
          // we've got instance of Sammy.Event
          e = name;
          eventName = [this.eventNamespace(), e.type].join('.');
          e.originalTarget = e.target;
          e.target = this;
        }

        console.log("Handling event ", eventName);
        if(this.app._listeners[eventName]) {
          $.each(this.app._listeners[eventName], function(i) {
            // If handler didn't cancel propagation by returning false
            // and didn't stop immediate propagation, the continue.
            // Else don't execute other handlers
            continuePropagation = this(e, data) !== false;
            return continuePropagation && !e.isImmediatePropagationStopped;
          });

        }
        
        // If none handler explicitly canceled propagation by calling e.stopPropagation()
        // and none handler returned false (implicit cancel)
        if( !e.isPropagationStopped && continuePropagation ) {
          if( this.parent ) {
            this.parent.trigger(e, data);
          }
        }
      }
      return this;
    };

    // Works just like `jQuery.fn.bind()` with a couple noteable differences.
    //
    // * All events are bound within the `eventNamespace()`
    // * Events are not actually bound until the application is started with `run()`
    // * callbacks are evaluated within the context of a Sammy.EventContext
    //
    // See http://code.quirkey.com/sammy/docs/events.html for more info.
    //
    Sammy.Component.prototype.bind = function(name, data, callback) {
      var comp = this;
      // build the callback
      // if the arity is 2, callback is the second argument
      if (typeof callback == 'undefined') { callback = data; }
      var listener_callback =  function() {
        // pull off the context from the arguments to the callback
        var e, context, data;
        e       = arguments[0];
        data    = arguments[1];
        if (data && data.context) {
          context = data.context;
          delete data.context;
        } else {
          context = new comp.context_prototype(comp, 'bind', e.type, data/*, e.target*/);
        }
        e.cleaned_type = e.type.replace(comp.eventNamespace(), '');
        return callback.apply(context, [e, data]);
      };

      this._listen(name, listener_callback);
      
      return this;
    };

    Sammy.Component.prototype._listen = function(name, callback) {
      var eventName = [this.eventNamespace(), name].join('.');

      this.app._listeners[eventName] = this.app._listeners[eventName] || [];
      this.app._listeners[eventName].push(callback);

      return this;
    };

    Sammy.Component.prototype._unlisten = function(name, callback) {
      var eventName = [this.eventNamespace(), name].join('.'),
          app = this.app;

      if(app._listeners[eventName] != undefined) {
        $.each(app._listeners[eventName], function(i) {
          if(this == callback) { // if we've got the right callback
            app._listeners[eventName].splice(i, 1); // remove it from listeners
            return false; // exit foreach
          }
        });
      }
      return this;
    };

    // Will bind a single callback function to every event that is already
    // being listened to in the component.
    //
    // Used internally for debug logging.
    Sammy.Component.prototype.bindToAllEvents = function(callback) {
      var component = this;
      
      $.each(this.app._listeners.keys(true), function(i, name) {
        // Don't bind to app events and bind only to this component's events
        if (component.app.APP_EVENTS.indexOf(name) == -1 && name.indexOf(component.eventNamespace()) == 0) {
          component.bind(name.replace(component.eventNamespace() + '.', ''), callback);
        }
      });
      return this;
    };

    // Helpers extends the EventContext prototype specific to this app.
    // This allows you to define app specific helper functions that can be used
    // whenever you're inside of an event context (templates, routes, bind).
    //
    // ### Example
    //
    //    var app = $.sammy(function() {
    //
    //      helpers({
    //        upcase: function(text) {
    //         return text.toString().toUpperCase();
    //        }
    //      });
    //
    //      get('#/', function() { with(this) {
    //        // inside of this context I can use the helpers
    //        $('#main').html(upcase($('#main').text());
    //      }});
    //
    //    });
    //
    //
    // ### Arguments
    //
    // * `extensions` An object collection of functions to extend the context.
    //
    Sammy.Component.prototype.helpers = function(extensions) {
      $.extend(this.context_prototype.prototype, extensions);
      return this;
    };

    // Helper extends the event context just like `helpers()` but does it
    // a single method at a time. This is especially useful for dynamically named
    // helpers
    //
    // ### Example
    //
    //     // Trivial example that adds 3 helper methods to the context dynamically
    //     var app = $.sammy(function(app) {
    //
    //       $.each([1,2,3], function(i, num) {
    //         app.helper('helper' + num, function() {
    //           this.log("I'm helper number " + num);
    //         });
    //       });
    //
    //       this.get('#/', function() {
    //         this.helper2(); //=> I'm helper number 2
    //       });
    //     });
    //
    // ### Arguments
    //
    // * `name` The name of the method
    // * `method` The function to be added to the prototype at `name`
    //
    Sammy.Component.prototype.helper = function(name, method) {
      this.context_prototype.prototype[name] = method;
      return this;
    };

    // `use()` is the entry point for including Sammy plugins.
    // The first argument to use should be a function() that is evaluated
    // in the context of the current application, just like the `app_function`
    // argument to the `Sammy.Application` constructor.
    //
    // Any additional arguments are passed to the app function sequentially.
    //
    // For much more detail about plugins, check out:
    // http://code.quirkey.com/sammy/doc/plugins.html
    //
    // ### Example
    //
    //      var MyPlugin = function(app, prepend) {
    //
    //        this.helpers({
    //          myhelper: function(text) {
    //            alert(prepend + " " + text);
    //          }
    //        });
    //
    //      };
    //
    //      var app = $.sammy(function() {
    //
    //        this.use(MyPlugin, 'This is my plugin');
    //
    //        this.get('#/', function() {
    //          this.myhelper('and dont you forget it!');
    //          //=> Alerts: This is my plugin and dont you forget it!
    //        });
    //
    //      });
    //
    // If plugin is passed as a string it assumes your are trying to load
    // Sammy."Plugin". This is the prefered way of loading core Sammy plugins
    // as it allows for better error-messaging.
    //
    // ### Example
    //
    //      $.sammy(function() {
    //        this.use('Mustache'); //=> Sammy.Mustache
    //        this.use('Storage'); //=> Sammy.Storage
    //      });
    //
    Sammy.Component.prototype.use = function() {
      // flatten the arguments
      var args = _makeArray(arguments),
          plugin = args.shift(),
          plugin_name = plugin || '';
      try {
        args.unshift(this);
        if (typeof plugin == 'string') {
          plugin_name = 'Sammy.' + plugin;
          plugin = Sammy[plugin];
        }
        plugin.apply(this, args);
      } catch(e) {
        if (typeof plugin === 'undefined') {
          this.app.error("Plugin Error: called use() but plugin (" + plugin_name.toString() + ") is not defined", e);
        } else if (!_isFunction(plugin)) {
          this.app.error("Plugin Error: called use() but '" + plugin_name.toString() + "' is not a function", e);
        } else {
          this.app.error("Plugin Error", e);
        }
      }
      return this;
    };

    // Should remove all managed DOM nodes and any other resources
    // @abstract
    Sammy.Component.prototype.destroy = function() {

    };

    Sammy.Component.prototype.createComponent = function(name, componentFunction) {
      this.components[name] = new Sammy.Component(componentFunction, name, this.app, this);
      return this.components[name];
    };

    Sammy.Component.prototype.getComponent = function(name) {
      return this.components[name];
    };

    /**
     * Removes component and destroys all listeners binded to it
     */
    Sammy.Component.prototype.removeComponent = function(name) {
      // @TODO remove registered routes
      if(this.components[name]) {
        var component = this;
        $.each(this.app._listeners.keys(true), function(i, namespacedEvent) {
          if(namespacedEvent.indexOf(component.components[name].eventNamespace()) == 0 ) {
            delete component.app._listeners[namespacedEvent];
          }
        });

        this.components[name].destroy();
        delete this.components[name];
      }
    };

    Sammy.Component.prototype.toString = function() {
      return 'Sammy.Component:' + this.name;
    };


    // Alias for route('get', ...)
    Sammy.Component.prototype.get = _routeWrapper('get');

    // Alias for route('post', ...)
    Sammy.Component.prototype.post = _routeWrapper('post');

    // Alias for route('put', ...)
    Sammy.Component.prototype.put = _routeWrapper('put');

    // Alias for route('delete', ...)
    Sammy.Component.prototype.del = _routeWrapper('delete');

    // Alias for route('any', ...)
    Sammy.Component.prototype.any = _routeWrapper('any');

    // `mapRoutes` takes an array of arrays, each array being passed to route()
    // as arguments, this allows for mass definition of routes. Another benefit is
    // this makes it possible/easier to load routes via remote JSON.
    //
    // ### Example
    //
    //    var app = $.sammy(function() {
    //
    //      this.mapRoutes([
    //          ['get', '#/', function() { this.log('index'); }],
    //          // strings in callbacks are looked up as methods on the app
    //          ['post', '#/create', 'addUser'],
    //          // No verb assumes 'any' as the verb
    //          [/dowhatever/, function() { this.log(this.verb, this.path)}];
    //        ]);
    //    })
    //
    Sammy.Component.prototype.mapRoutes = function(route_array) {
      var component = this;
      $.each(route_array, function(i, route_args) {
        component.route.apply(component, route_args);
      });
      return this;
    };

    // Takes a single callback that is pushed on to a stack.
    // Before any route is run, the callbacks are evaluated in order within
    // the current `Sammy.EventContext`
    //
    // If any of the callbacks explicitly return false, execution of any
    // further callbacks and the route itself is halted.
    //
    // You can also provide a set of options that will define when to run this
    // before based on the route it proceeds.
    //
    // ### Example
    //
    //      var app = $.sammy(function() {
    //
    //        // will run at #/route but not at #/
    //        this.before('#/route', function() {
    //          //...
    //        });
    //
    //        // will run at #/ but not at #/route
    //        this.before({except: {path: '#/route'}}, function() {
    //          this.log('not before #/route');
    //        });
    //
    //        this.get('#/', function() {});
    //
    //        this.get('#/route', function() {});
    //
    //      });
    //
    // See `contextMatchesOptions()` for a full list of supported options
    //
    Sammy.Component.prototype.before = function(options, callback) {
      if (_isFunction(options)) {
        callback = options;
        options = {};
      }
      this.befores.push([options, callback]);
      return this;
    };

    // A shortcut for binding a callback to be run after a route is executed.
    // After callbacks have no guarunteed order.
    Sammy.Component.prototype.after = function(callback) {
      /* make ti like this:
       * return this.bind('event-context-after', function(){
       *    arguments[0].stopPropagation();
       *    callback.apply(this, arguments);
       * });
       * Need to properly test though
       */
      return this.bind('event-context-after', callback);
    };


    // Adds an around filter to the application. around filters are functions
    // that take a single argument `callback` which is the entire route
    // execution path wrapped up in a closure. This means you can decide whether
    // or not to proceed with execution by not invoking `callback` or,
    // more usefuly wrapping callback inside the result of an asynchronous execution.
    //
    // ### Example
    //
    // The most common use case for around() is calling a _possibly_ async function
    // and executing the route within the functions callback:
    //
    //      var app = $.sammy(function() {
    //
    //        var current_user = false;
    //
    //        function checkLoggedIn(callback) {
    //          // /session returns a JSON representation of the logged in user
    //          // or an empty object
    //          if (!current_user) {
    //            $.getJSON('/session', function(json) {
    //              if (json.login) {
    //                // show the user as logged in
    //                current_user = json;
    //                // execute the route path
    //                callback();
    //              } else {
    //                // show the user as not logged in
    //                current_user = false;
    //                // the context of aroundFilters is an EventContext
    //                this.redirect('#/login');
    //              }
    //            });
    //          } else {
    //            // execute the route path
    //            callback();
    //          }
    //        };
    //
    //        this.around(checkLoggedIn);
    //
    //      });
    //
    // @TODO maybe options here would also be nice? For instance, I want to wrap only some actions, but not the others
    //
    Sammy.Component.prototype.around = function(callback) {
      this.arounds.push(callback);
      return this;
    };

    // Returns a copy of the given path with any query string after the hash
    // removed.
    Sammy.Component.prototype.routablePath = function(path) {
      return path.replace(QUERY_STRING_MATCHER, '');
    };

    // Given a verb and a String path, will return either a route object or false
    // if a matching route can be found within the current defined set.
    Sammy.Component.prototype.lookupRoute = function(verb, path) {
      var comp = this, routed = false;
      if (typeof this.routes[verb] != 'undefined') {
        $.each(this.routes[verb], function(i, route) {
          if (comp.routablePath(path).match(route.path)) {
            routed = route;
            return false;
          }
        });
      }
      return routed;
    };

    // Check whether there's a component that has registered this route.
    // If yes, return this component (route handling is handed to it)
    // @return {object|bool} returns false if no component can handle the route
    Sammy.Component.prototype.lookupComponentRoute = function(verb, path) {
      var comp = this, componentRoute = false;
      if (typeof this.componentRoutes[verb] != 'undefined') {
        $.each(this.componentRoutes[verb], function(i, route) {
          if (comp.routablePath(path).match(route.path)) {
            componentRoute = route;
            return false;
          }
        });
      }
      return componentRoute;
    };

    // `route()` is the main method for defining routes within an application.
    // For great detail on routes, check out: http://code.quirkey.com/sammy/doc/routes.html
    //
    // This method also has aliases for each of the different verbs (eg. `get()`, `post()`, etc.)
    //
    // ### Arguments
    //
    // * `verb` A String in the set of ROUTE_VERBS or 'any'. 'any' will add routes for each
    //    of the ROUTE_VERBS. If only two arguments are passed,
    //    the first argument is the path, the second is the callback and the verb
    //    is assumed to be 'any'.
    // * `path` A Regexp or a String representing the path to match to invoke this verb.
    // * `callback` A Function that is called/evaluated whent the route is run see: `runRoute()`.
    //    It is also possible to pass a string as the callback, which is looked up as the name
    //    of a method on the application.
    //
    Sammy.Component.prototype.route = function(verb, path, callback) {
      var comp = this, param_names = [], add_route, path_match;

      // if the method signature is just (path, callback)
      // assume the verb is 'any'
      if (!callback && _isFunction(path)) {
        path = verb;
        callback = path;
        verb = 'any';
      }

      verb = verb.toLowerCase(); // ensure verb is lower case

      // if path is a string turn it into a regex
      if (path.constructor == String) {

        // Needs to be explicitly set because IE will maintain the index unless NULL is returned,
        // which means that with two consecutive routes that contain params, the second set of params will not be found and end up in splat instead of params
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/RegExp/lastIndex
        PATH_NAME_MATCHER.lastIndex = 0;

        // find the names
        while ((path_match = PATH_NAME_MATCHER.exec(path)) !== null) {
          param_names.push(path_match[1]);
        }
        // replace with the path replacement
        path = new RegExp("^" + path.replace(PATH_NAME_MATCHER, PATH_REPLACER) + "$");
      }
      // lookup callback
      if (typeof callback == 'string') {
        callback = comp[callback];
      }

      add_route = function(with_verb) {
        var r = {verb: with_verb, path: path, callback: callback, param_names: param_names};
        // add route to routes array
        comp.routes[with_verb] = comp.routes[with_verb] || [];
        // place routes in order of definition
        comp.routes[with_verb].push(r);
        if( comp.parent ) { // notify parent this component can handle the route
          comp.parent.registerComponentRoute(r, comp);
        }
      };

      if (verb === 'any') {
        $.each(this.ROUTE_VERBS, function(i, v) {add_route(v);});
      } else {
        add_route(verb);
      }

      // return the component
      return this;
    };

    Sammy.Component.prototype.registerComponentRoute = function(route, component) {
      this.componentRoutes[route.verb] = this.componentRoutes[route.verb] || [];
      this.componentRoutes[route.verb].push($.extend({}, route, {component: component}));

      if( this.parent ) {
        this.parent.registerComponentRoute(route, this);
      }
    };

    // First, invokes `lookupRoute()` and if a route is found, parses the
    // possible URL params and then invokes the route's callback within a new
    // `Sammy.EventContext`. If the route can not be found, it calls
    // `notFound()`. If `raise_errors` is set to `true` and
    // the `error()` has not been overriden, it will throw an actual JS
    // error.
    //
    // You probably will never have to call this directly.
    //
    // ### Arguments
    //
    // * `verb` A String for the verb.
    // * `path` A String path to lookup.
    // * `params` An Object of Params pulled from the URI or passed directly.
    //
    // ### Returns
    //
    // Either returns the value returned by the route callback or raises a 404 Not Found error.
    //
    //
    Sammy.Component.prototype.runRoute = function(verb, path, params, target) {
      var comp = this,
          route = this.lookupRoute(verb, path),
          componentRoute = this.lookupComponentRoute(verb, path),
          context,
          wrapped_route,
          arounds,
          around,
          befores,
          before,
          callback_args,
          path_params,
          final_returned,
          component,
          isNativeRoute = true; // whether this component handles the route (not it's child)
      
      if (typeof params == 'undefined') { params = {}; }

      $.extend(params, this._parseQueryString(path));

      if (componentRoute) {
        isNativeRoute = false;
        component = componentRoute.component;
        route = componentRoute;
        route.callback = function() {
          return component.runRoute(verb, path, params, target);
        };
      }

      if(route) {

        // Trigger only once by component which handles the route,
        // not any of its parents
        if(isNativeRoute) {
          this.trigger('route-found', {route: route});
        }

        // pull out the params from the path
        // @TODO this will be executed once for each component hierarchy level.
        // Maybe not that big deal
        if ((path_params = route.path.exec(this.routablePath(path))) !== null) {
          // first match is the full path
          path_params.shift();
          // for each of the matches
          $.each(path_params, function(i, param) {
            // if theres a matching param name
            if (route.param_names[i]) {
              // set the name to the match
              params[route.param_names[i]] = _decode(param);
            } else {
              // initialize 'splat'
              if (!params.splat) { params.splat = []; }
              params.splat.push(_decode(param));
            }
          });
        }

        // set event context
        context  = new this.context_prototype(this, verb, path, params, target);
        // ensure arrays
        arounds = this.arounds.slice(0);
        befores = this.befores.slice(0);
        // set the callback args to the context + contents of the splat
        callback_args = [context].concat(params.splat);
        // wrap the route up with the before filters
        wrapped_route = function() {
          var returned;
          while (befores.length > 0) {
            before = befores.shift();
            // check the options
            if (comp.contextMatchesOptions(context, before[0])) {
              returned = before[1].apply(context, [context]);
              if (returned === false) { return false; }
            }
          }
          comp.app.last_route = route;
          if( isNativeRoute) {
            context.trigger('event-context-before', {context: context});
          }
          returned = route.callback.apply(context, callback_args);
          if( isNativeRoute ) {
            context.trigger('event-context-after', {context: context});
          }
          return returned;
        };
        $.each(arounds.reverse(), function(i, around) {
          var last_wrapped_route = wrapped_route;
          wrapped_route = function() { return around.apply(context, [last_wrapped_route]); };
        });
        try {
          final_returned = wrapped_route();
        } catch(e) {
          this.app.error(['500 Error', verb, path].join(' '), e);
        }
        return final_returned;
      } else {
        return this.notFound(verb, path);
      }
    };

    // Matches an object of options against an `EventContext` like object that
    // contains `path` and `verb` attributes. Internally Sammy uses this
    // for matching `before()` filters against specific options. You can set the
    // object to _only_ match certain paths or verbs, or match all paths or verbs _except_
    // those that match the options.
    //
    // ### Example
    //
    //     var app = $.sammy(),
    //         context = {verb: 'get', path: '#/mypath'};
    //
    //     // match against a path string
    //     app.contextMatchesOptions(context, '#/mypath'); //=> true
    //     app.contextMatchesOptions(context, '#/otherpath'); //=> false
    //     // equivilent to
    //     app.contextMatchesOptions(context, {only: {path:'#/mypath'}}); //=> true
    //     app.contextMatchesOptions(context, {only: {path:'#/otherpath'}}); //=> false
    //     // match against a path regexp
    //     app.contextMatchesOptions(context, /path/); //=> true
    //     app.contextMatchesOptions(context, /^path/); //=> false
    //     // match only a verb
    //     app.contextMatchesOptions(context, {only: {verb:'get'}}); //=> true
    //     app.contextMatchesOptions(context, {only: {verb:'post'}}); //=> false
    //     // match all except a verb
    //     app.contextMatchesOptions(context, {except: {verb:'post'}}); //=> true
    //     app.contextMatchesOptions(context, {except: {verb:'get'}}); //=> false
    //     // match all except a path
    //     app.contextMatchesOptions(context, {except: {path:'#/otherpath'}}); //=> true
    //     app.contextMatchesOptions(context, {except: {path:'#/mypath'}}); //=> false
    //
    Sammy.Component.prototype.contextMatchesOptions = function(context, match_options, positive) {
      // empty options always match
      var options = match_options;
      if (typeof options === 'undefined' || options == {}) {
        return true;
      }
      if (typeof positive === 'undefined') {
        positive = true;
      }
      // normalize options
      if (typeof options === 'string' || _isFunction(options.test)) {
        options = {path: options};
      }
      if (options.only) {
        return this.contextMatchesOptions(context, options.only, true);
      } else if (options.except) {
        return this.contextMatchesOptions(context, options.except, false);
      }
      var path_matched = true, verb_matched = true;
      if (options.path) {
        // wierd regexp test
        if (_isFunction(options.path.test)) {
          path_matched = options.path.test(context.path);
        } else {
          path_matched = (options.path.toString() === context.path);
        }
      }
      if (options.verb) {
        verb_matched = options.verb === context.verb;
      }
      return positive ? (verb_matched && path_matched) : !(verb_matched && path_matched);
    };

    Sammy.Component.prototype._parseQueryString = function(path) {
      var params = {}, parts, pairs, pair, i;

      parts = path.match(QUERY_STRING_MATCHER);
      if (parts) {
        pairs = parts[1].split('&');
        for (i = 0; i < pairs.length; i++) {
          pair = pairs[i].split('=');
          params = this._parseParamPair(params, _decode(pair[0]), _decode(pair[1]));
        }
      }
      return params;
    };

    Sammy.Component.prototype._parseParamPair = function(params, key, value) {
      if (params[key]) {
        if (_isArray(params[key])) {
          params[key].push(value);
        } else {
          params[key] = [params[key], value];
        }
      } else {
        params[key] = value;
      }
      return params;
    };

    // Delegate to app.
    // Implementations should override if needed
    // @param content {DOMElement|jQuery|string} anything that $('').html(content) will take
    Sammy.Component.prototype.swap = function(content) {
      if('$element' in this) {
        if($.isFunction(this.$element)) {
          return this.$element().html(content);
        } else {
          return $(this.$element).html(content);
        }
      }
      return this.app.swap(content);
    };

    /**
     * A shorter version of the "compose content received from your subcomponents" logic
     * @param {jQuery} content html to place subcomponents into
     * @param {object} partials container for rendered subcomponent parts
     * @param ... each subcomponent to compose into the template
     * @returns content composed html
     */
    Sammy.Component.prototype.composeContent = function(content, partials) {
      var args = _makeArray(arguments);
      
      for(var i = 2; i < args.length; ++i) {
        var arg = args[i];
        var sel = content.findInclSelf(arg.$element);
        // find inclSelf is a custom jQuery function
        /**
	$.fn.findInclSelf = function(selector) {
		var found = this.filter(selector);
		if(!found.length) {
			found = this.find(selector);
		}
		return found;
	}
	
         */
        sel.html(partials[arg.name]);
      }
      
      return content;
    };
        
    // Delegate to app.error
    Sammy.Component.prototype.error = function(message, original_error) {
      this.app.error(message, original_error);
    };

  })();

  (function(){
    // Explicit definition for IDE to show Sammy.Application in navigator
    Sammy.Application = function(){};
  
    //  Sammy.Application is the Base prototype for defining 'applications'.
    //  An 'application' is a collection of 'routes' and bound events that is
    //  attached to an element when `run()` is called.
    //  The only argument an 'app_function' is evaluated within the context of the application.
    //
    //  Calling new Sammy.Application(app_function) will actually result in calling
    //  Sammy.Application.init(app_function) applied to new instance
    //  @see Sammy.Class.extend
    Sammy.Application = Sammy.Component.extend({

      /**
       * @param app_function {function}
       */
      init: function(app_function) {
        var app = this;
        // Global listener cache
        this._listeners        = new Sammy.Object({});

        // app := this
        // parent := null
        this._super(app_function, 'sammy-app', this, null);

        // set the location proxy if not defined to the default (HashLocationProxy)
        if (!this._location_proxy) {
          this.setLocationProxy(new Sammy.HashLocationProxy(this, this.run_interval_every));
        }
        if (this.debug) {
          /**
           * Something strange happens if we have
           * Sammy.Application.prototype.bindToAllEvents = function(){
           *  ...
           *  this._super();
           *  }
           *  and call it from here.
           *
           *  instead of getting this._super() --> Component.bindToAllEvents()
           *  I get this.super() --> Component.init
           *
           *  Don't get and won't digg into this now
           */
          var debugFn = function(e, data) {
            this.log(this.app.toString(), e.cleaned_type, data || {});
          };
          this.bindToAllEvents(debugFn);
          // bind to the APP_EVENTS first
          $.each(this.APP_EVENTS, function(i, e) {
            app.bind(e, debugFn);
          });
        }
      }
    });

    // the four route verbs
    Sammy.Application.prototype.ROUTE_VERBS = ['get','post','put','delete'];

    // An array of the default events triggered by the
    // application during its lifecycle
    Sammy.Application.prototype.APP_EVENTS = ['run',
                 'unload',
                 'lookup-route',
                 'run-route',
                 'route-found',
                 'event-context-before',
                 'event-context-after',
                 'changed',
                 'error',
                 'check-form-submission',
                 'redirect',
                 'location-changed'];

    Sammy.Application.prototype._last_route = null;
    Sammy.Application.prototype._location_proxy = null;
    Sammy.Application.prototype._running = false;

    // Defines what element the application is bound to. Provide a selector
    // (parseable by `jQuery()`) and this will be used by `$element()`
    Sammy.Application.prototype.element_selector = 'body';

    // When set to true, logs all of the default events using `log()`
    Sammy.Application.prototype.debug = false;

    // When set to true, and the error() handler is not overriden, will actually
    // raise JS errors in routes (500) and when routes can't be found (404)
    Sammy.Application.prototype.raise_errors = false;

    // The time in milliseconds that the URL is queried for changes
    Sammy.Application.prototype.run_interval_every = 50;

    // The default template engine to use when using `partial()` in an
    // `EventContext`. `template_engine` can either be a string that
    // corresponds to the name of a method/helper on EventContext or it can be a function
    // that takes two arguments, the content of the unrendered partial and an optional
    // JS object that contains interpolation data. Template engine is only called/refered
    // to if the extension of the partial is null or unknown. See `partial()`
    // for more information
    Sammy.Application.prototype.template_engine = null;

    // //=> Sammy.Application: body
    Sammy.Application.prototype.toString = function() {
      return 'Sammy.Application:' + this.element_selector;
    };

    // returns a jQuery object of the Applications bound element.
    // @TODO make this available in component too
    Sammy.Application.prototype.$element = function() {
      return $(this.element_selector);
    };

    // Sets the location proxy for the current app. By default this is set to
    // a new `Sammy.HashLocationProxy` on initialization. However, you can set
    // the location_proxy inside you're app function to give your app a custom
    // location mechanism. See `Sammy.HashLocationProxy` and `Sammy.DataLocationProxy`
    // for examples.
    //
    // `setLocationProxy()` takes an initialized location proxy.
    //
    // ### Example
    //
    //        // to bind to data instead of the default hash;
    //        var app = $.sammy(function() {
    //          this.setLocationProxy(new Sammy.DataLocationProxy(this));
    //        });
    //
    Sammy.Application.prototype.setLocationProxy = function(new_proxy) {
      var original_proxy = this._location_proxy;
      this._location_proxy = new_proxy;
      if (this.isRunning()) {
        if (original_proxy) {
          // if there is already a location proxy, unbind it.
          original_proxy.unbind();
        }
        this._location_proxy.bind();
      }
    };

    // Reruns the current route
    Sammy.Application.prototype.refresh = function() {
      this.last_location = null;
      this.trigger('location-changed');
      return this;
    };

    // Returns `true` if the current application is running.
    Sammy.Application.prototype.isRunning = function() {
      return this._running;
    };

    // Actually starts the application's lifecycle. `run()` should be invoked
    // within a document.ready block to ensure the DOM exists before binding events, etc.
    //
    // ### Example
    //
    //    var app = $.sammy(function() { ... }); // your application
    //    $(function() { // document.ready
    //        app.run();
    //     });
    //
    // ### Arguments
    //
    // * `start_url` Optionally, a String can be passed which the App will redirect to
    //   after the events/routes have been bound.
    Sammy.Application.prototype.run = function(start_url) {
      if (this.isRunning()) {return false;}
      var app = this;

      this._running = true;
      this.trigger('run', {start_url: start_url});
      // set last location
      this.last_location = null;
      if (this.getLocation() == '' && typeof start_url != 'undefined') {
        this.setLocation(start_url);
      }
      // check url
      this._checkLocation();
      this._location_proxy.bind();
      this.bind('location-changed', function() {
        app._checkLocation();
      });

      // bind to submit to capture post/put/delete routes
      // Here using low level (DOM) jQuery events
      this.$element().bind('submit', function(e) {
        var returned = app._checkFormSubmission($(e.target).closest('form'));
        return (returned === false) ? e.preventDefault() : false;
      });

      // bind unload to body unload
      $(window).bind('beforeunload', function() {
        app.unload();
      });

      // trigger html changed
      return this.trigger('changed');
    };

    // @TODO for some reason this._super() is undefined here
//    // Override to trigger app event
//    Sammy.Application.prototype.lookupRoute = function(verb, path) {
//      this.trigger('lookup-route', {verb: verb, path: path});
//      return this._super(verb, path);
//    };
//
//    // Override to trigger app event
//    Sammy.Application.prototype.runRoute = function(verb, path, params, target) {
//      this.log('runRoute', [verb, path].join(' '));
//      this.trigger('run-route', {verb: verb, path: path, params: params});
//      return this._super(verb, path, params, target);
//    }

    // The opposite of `run()`, un-binds all event listeners and intervals
    // `run()` Automaticaly binds a `onunload` event to run this when
    // the document is closed.
    Sammy.Application.prototype.unload = function() {
      if (!this.isRunning()) {return false;}
      var app = this;
      this.trigger('unload');
      // clear interval
      this._location_proxy.unbind();
      // unbind form submits
      this.$element().unbind('submit').removeClass(app.eventNamespace());
      // unbind all events
      this._listeners = new Sammy.Object({});
      this._running = false;
      return this;
    };


    // Delegates to the `location_proxy` to get the current location.
    // See `Sammy.HashLocationProxy` for more info on location proxies.
    Sammy.Application.prototype.getLocation = function() {
      return this._location_proxy.getLocation();
    };

    // Delegates to the `location_proxy` to set the current location.
    // See `Sammy.HashLocationProxy` for more info on location proxies.
    //
    // ### Arguments
    //
    // * `new_location` A new location string (e.g. '#/')
    //
    Sammy.Application.prototype.setLocation = function(new_location) {
      return this._location_proxy.setLocation(new_location);
    };

    // Swaps the content of `$element()` with `content`
    // You can override this method to provide an alternate swap behavior
    // for `EventContext.partial()`.
    //
    // ### Example
    //
    //    var app = $.sammy(function() {
    //
    //      // implements a 'fade out'/'fade in'
    //      this.swap = function(content) {
    //        this.$element().hide('slow').html(content).show('slow');
    //      }
    //
    //      get('#/', function() {
    //        this.partial('index.html.erb') // will fade out and in
    //      });
    //
    //    });
    //
    Sammy.Application.prototype.swap = function(content) {
      return this.$element().html(content);
    };

    // a simple global cache for templates. Uses the same semantics as
    // `Sammy.Cache` and `Sammy.Storage` so can easily be replaced with
    // a persistant storage that lasts beyond the current request.
    Sammy.Application.prototype.templateCache = function(key, value) {
      if (typeof value != 'undefined') {
        return _template_cache[key] = value;
      } else {
        return _template_cache[key];
      }
    };

    // clear the templateCache
    Sammy.Application.prototype.clearTemplateCache = function() {
      return _template_cache = {};
    };

    // This thows a '404 Not Found' error by invoking `error()`.
    // Override this method or `error()` to provide custom
    // 404 behavior (i.e redirecting to / or showing a warning)
    Sammy.Application.prototype.notFound = function(verb, path) {
      var ret = this.error(['404 Not Found', verb, path].join(' '));
      return (verb === 'get') ? ret : true;
    };

    // The base error handler takes a string `message` and an `Error`
    // object. If `raise_errors` is set to `true` on the app level,
    // this will re-throw the error to the browser. Otherwise it will send the error
    // to `log()`. Override this method to provide custom error handling
    // e.g logging to a server side component or displaying some feedback to the
    // user.
    Sammy.Application.prototype.error = function(message, original_error) {
      if (!original_error) { original_error = new Error(); }
      original_error.message = [message, original_error.message].join(' ');
      this.trigger('error', {message: original_error.message, error: original_error});
      if (this.raise_errors) {
        throw(original_error);
      } else {
        this.log(original_error.message, original_error);
      }
    };

    Sammy.Application.prototype._checkLocation = function() {
      var location, returned;
      // get current location
      location = this.getLocation();
      // compare to see if hash has changed
      if (!this.last_location || this.last_location[0] != 'get' || this.last_location[1] != location) {
        // reset last location
        this.last_location = ['get', location];
        // lookup route for current hash
        returned = this.runRoute('get', location);
      }
      return returned;
    };

    Sammy.Application.prototype._getFormVerb = function(form) {
      var $form = $(form), verb, $_method;
      $_method = $form.find('input[name="_method"]');
      if ($_method.length > 0) { verb = $_method.val(); }
      if (!verb) { verb = $form[0].getAttribute('method'); }
      return $.trim(verb.toString().toLowerCase());
    };

    Sammy.Application.prototype._checkFormSubmission = function(form) {
      var $form, path, verb, params, returned;
      this.trigger('check-form-submission', {form: form});
      $form = $(form);
      path  = $form.attr('action');
      verb  = this._getFormVerb($form);
      if (!verb || verb == '') { verb = 'get'; }
      this.log('_checkFormSubmission', $form, path, verb);
      if (verb === 'get') {
        this.setLocation(path + '?' + $form.serialize());
        returned = false;
      } else {
        params = $.extend({}, this._parseFormParams($form));
        returned = this.runRoute(verb, path, params, form.get(0));
      }
      return (typeof returned == 'undefined') ? false : returned;
    };

    Sammy.Application.prototype._parseFormParams = function($form) {
      var params = {},
          form_fields = $form.serializeArray(),
          i;
      for (i = 0; i < form_fields.length; i++) {
        params = this._parseParamPair(params, form_fields[i].name, form_fields[i].value);
      }
      return params;
    };


  })();

  // Sammy.RenderContext
  (function(){
    // `Sammy.RenderContext` is an object that makes sequential template loading,
    // rendering and interpolation seamless even when dealing with asyncronous
    // operations.
    //
    // `RenderContext` objects are not usually created directly, rather they are
    // instatiated from an `Sammy.EventContext` by using `render()`, `load()` or
    // `partial()` which all return `RenderContext` objects.
    //
    // `RenderContext` methods always returns a modified `RenderContext`
    // for chaining (like jQuery itself).
    //
    // The core magic is in the `then()` method which puts the callback passed as
    // an argument into a queue to be executed once the previous callback is complete.
    // All the methods of `RenderContext` are wrapped in `then()` which allows you
    // to queue up methods by chaining, but maintaing a guarunteed execution order
    // even with remote calls to fetch templates.
    //
    Sammy.RenderContext = function(event_context) {
      this.event_context    = event_context;
      this.callbacks        = [];
      this.previous_content = null;
      this.content          = null;
      this.next_engine      = false;
      this.waiting          = false;
    };

    // The "core" of the `RenderContext` object, adds the `callback` to the
    // queue. If the context is `waiting` (meaning an async operation is happening)
    // then the callback will be executed in order, once the other operations are
    // complete. If there is no currently executing operation, the `callback`
    // is executed immediately.
    //
    // The value returned from the callback is stored in `content` for the
    // subsiquent operation. If you return `false`, the queue will pause, and
    // the next callback in the queue will not be executed until `next()` is
    // called. This allows for the guarunteed order of execution while working
    // with async operations.
    //
    // If then() is passed a string instead of a function, the string is looked
    // up as a helper method on the event context.
    //
    // ### Example
    //
    //      this.get('#/', function() {
    //        // initialize the RenderContext
    //        // Even though `load()` executes async, the next `then()`
    //        // wont execute until the load finishes
    //        this.load('myfile.txt')
    //            .then(function(content) {
    //              // the first argument to then is the content of the
    //              // prev operation
    //              $('#main').html(content);
    //            });
    //      });
    //
    Sammy.RenderContext.prototype.then = function(callback) {
      if (!_isFunction(callback)) {
        // if a string is passed to then, assume we want to call
        // a helper on the event context in its context
        if (typeof callback === 'string' && callback in this.event_context) {
          var helper = this.event_context[callback];
          callback = function(content) {
            return helper.apply(this.event_context, [content]);
          };
        } else {
          return this;
        }
      }
      var context = this;
      if (this.waiting) {
        this.callbacks.push(callback);
      } else {
        this.wait();
        window.setTimeout(function() {
          var returned = callback.apply(context, [context.content, context.previous_content]);
          if (returned !== false) {
            context.next(returned);
          }
        }, 13);
      }
      return this;
    };

    // Pause the `RenderContext` queue. Combined with `next()` allows for async
    // operations.
    //
    // ### Example
    //
    //        this.get('#/', function() {
    //          this.load('mytext.json')
    //              .then(function(content) {
    //                var context = this,
    //                    data    = JSON.parse(content);
    //                // pause execution
    //                context.wait();
    //                // post to a url
    //                $.post(data.url, {}, function(response) {
    //                  context.next(JSON.parse(response));
    //                });
    //              })
    //              .then(function(data) {
    //                // data is json from the previous post
    //                $('#message').text(data.status);
    //              });
    //        });
    Sammy.RenderContext.prototype.wait = function() {
      this.waiting = true;
    };

    // Resume the queue, setting `content` to be used in the next operation.
    // See `wait()` for an example.
    Sammy.RenderContext.prototype.next = function(content) {
      this.waiting = false;
      if (typeof content !== 'undefined') {
        this.previous_content = this.content;
        this.content = content;
      }
      if (this.callbacks.length > 0) {
        this.then(this.callbacks.shift());
      }
    };

    // Load a template into the context.
    // The `location` can either be a string specifiying the remote path to the
    // file, a jQuery object, or a DOM element.
    //
    // No interpolation happens by default, the content is stored in
    // `content`.
    //
    // In the case of a path, unless the option `{cache: false}` is passed the
    // data is stored in the app's `templateCache()`.
    //
    // If a jQuery or DOM object is passed the `innerHTML` of the node is pulled in.
    // This is useful for nesting templates as part of the initial page load wrapped
    // in invisible elements or `<script>` tags. With template paths, the template
    // engine is looked up by the extension. For DOM/jQuery embedded templates,
    // this isnt possible, so there are a couple of options:
    //
    //  * pass an `{engine:}` option.
    //  * define the engine in the `data-engine` attribute of the passed node.
    //  * just store the raw template data and use `interpolate()` manually
    //
    // If a `callback` is passed it is executed after the template load.
    Sammy.RenderContext.prototype.load = function(location, options, callback) {
      var context = this;
      return this.then(function() {
        var should_cache, cached, is_json, location_array;
        if (_isFunction(options)) {
          callback = options;
          options = {};
        } else {
          options = $.extend({}, options);
        }
        if (callback) { this.then(callback); }
        if (typeof location === 'string') {
          // its a path
          is_json      = (location.match(/\.json$/) || options.json);
          should_cache = ((is_json && options.cache === true) || options.cache !== false);
          context.next_engine = context.event_context.engineFor(location);
          delete options.cache;
          delete options.json;
          if (options.engine) {
            context.next_engine = options.engine;
            delete options.engine;
          }
          if (should_cache && (cached = this.event_context.app.templateCache(location))) {
            return cached;
          }
          this.wait();
          $.ajax($.extend({
            url: location,
            data: {},
            dataType: is_json ? 'json' : null,
            type: 'get',
            success: function(data) {
              if (should_cache) {
                context.event_context.app.templateCache(location, data);
              }
              context.next(data);
            }
          }, options));
          return false;
        } else {
          // its a dom/jQuery
          if (location.nodeType) {
            return location.innerHTML;
          }
          if (location.selector) {
            // its a jQuery
            if(!location.length) {
              throw new Error("Tried to render a non-existant template: " + location.selector);
            }
            context.next_engine = location.attr('data-engine');
            if (options.clone === false) {
              return location.remove()[0].innerHTML.toString();
            } else {
              return location[0].innerHTML.toString();
            }
          }
        }
      });
    };

    // `load()` a template and then `interpolate()` it with data.
    //
    // ### Example
    //
    //      this.get('#/', function() {
    //        this.render('mytemplate.template', {name: 'test'});
    //      });
    //
    Sammy.RenderContext.prototype.render = function(location, data, callback) {
      if (_isFunction(location) && !data) {
        return this.then(location);
      } else {
        if (!data && this.content) { data = this.content; }
        return this.load(location)
                   .interpolate(data, location)
                   .then(callback);
      }
    };

    // `render()` the the `location` with `data` and then `swap()` the
    // app's `$element` with the rendered content.
    Sammy.RenderContext.prototype.partial = function(location, data) {
      return this.render(location, data).swap();
    };

    // defers the call of function to occur in order of the render queue.
    // The function can accept any number of arguments as long as the first
    // argument is a callback function. This is useful for putting arbitrary
    // asynchronous functions into the queue. The content passed to the
    // callback is passed as `content` to the next item in the queue.
    //
    // === Example
    //
    //        this.send($.getJSON, '/app.json')
    //            .then(function(json) {
    //              $('#message).text(json['message']);
    //            });
    //
    //
    Sammy.RenderContext.prototype.send = function() {
      var context = this,
          args = _makeArray(arguments),
          funct  = args.shift();

      if (_isArray(args[0])) { args = args[0]; }

      return this.then(function(content) {
        args.push(function(response) { context.next(response); });
        context.wait();
        funct.apply(funct, args);
        return false;
      });
    };

    // itterates over an array, applying the callback for each item item. the
    // callback takes the same style of arguments as `jQuery.each()` (index, item).
    // The return value of each callback is collected as a single string and stored
    // as `content` to be used in the next iteration of the `RenderContext`.
    Sammy.RenderContext.prototype.collect = function(array, callback, now) {
      var context = this;
      var coll = function() {
        if (_isFunction(array)) {
          callback = array;
          array = this.content;
        }
        var contents = [], doms = false;
        $.each(array, function(i, item) {
          var returned = callback.apply(context, [i, item]);
          if (returned.jquery && returned.length == 1) {
            returned = returned[0];
            doms = true;
          }
          contents.push(returned);
          return returned;
        });
        return doms ? contents : contents.join('');
      };
      return now ? coll() : this.then(coll);
    };

    // loads a template, and then interpolates it for each item in the `data`
    // array. If a callback is passed, it will call the callback with each
    // item in the array _after_ interpolation
    Sammy.RenderContext.prototype.renderEach = function(location, name, data, callback) {
      if (_isArray(name)) {
        callback = data;
        data = name;
        name = null;
      }
      return this.load(location).then(function(content) {
          var rctx = this;
          if (!data) {
            data = _isArray(this.previous_content) ? this.previous_content : [];
          }
          if (callback) {
            $.each(data, function(i, value) {
              var idata = {}, engine = this.next_engine || location;
              name ? (idata[name] = value) : (idata = value);
              callback(value, rctx.event_context.interpolate(content, idata, engine));
            });
          } else {
            return this.collect(data, function(i, value) {
              var idata = {}, engine = this.next_engine || location;
              name ? (idata[name] = value) : (idata = value);
              return this.event_context.interpolate(content, idata, engine);
            }, true);
          }
      });
    };

    // uses the previous loaded `content` and the `data` object to interpolate
    // a template. `engine` defines the templating/interpolation method/engine
    // that should be used. If `engine` is not passed, the `next_engine` is
    // used. If `retain` is `true`, the final interpolated data is appended to
    // the `previous_content` instead of just replacing it.
    Sammy.RenderContext.prototype.interpolate = function(data, engine, retain) {
      var context = this;
      return this.then(function(content, prev) {
        if (!data && prev) { data = prev; }
        if (this.next_engine) {
          engine = this.next_engine;
          this.next_engine = false;
        }
        var rendered = context.event_context.interpolate(content, data, engine);
        return retain ? prev + rendered : rendered;
      });
    };

    // executes `EventContext#swap()` with the `content`
    Sammy.RenderContext.prototype.swap = function() {
      return this.then(function(content) {
        this.event_context.swap(content);
      }).trigger('changed', {});
    };

    // Same usage as `jQuery.fn.appendTo()` but uses `then()` to ensure order
    Sammy.RenderContext.prototype.appendTo = function(selector) {
      return this.then(function(content) {
        $(selector).append(content);
      }).trigger('changed', {});
    };

    // Same usage as `jQuery.fn.prependTo()` but uses `then()` to ensure order
    Sammy.RenderContext.prototype.prependTo = function(selector) {
      return this.then(function(content) {
        $(selector).prepend(content);
      }).trigger('changed', {});
    };

    // Replaces the `$(selector)` using `html()` with the previously loaded
    // `content`
    Sammy.RenderContext.prototype.replace = function(selector) {
      return this.then(function(content) {
        $(selector).html(content);
      }).trigger('changed', {});
    };

    // trigger the event in the order of the event context. Same semantics
    // as `Sammy.EventContext#trigger()`. If data is ommitted, `content`
    // is sent as `{content: content}`
    Sammy.RenderContext.prototype.trigger = function(name, data) {
      return this.then(function(content) {
        if (typeof data == 'undefined') { data = {content: content}; }
        this.event_context.trigger(name, data);
      });
    };
  })();
  // end Sammy.RenderContext

  // Sammy.EventContext
  (function() {
    Sammy.EventContext = function(){};

    Sammy.EventContext = Sammy.Object.extend({
      // `Sammy.EventContext` objects are created every time a route is run or a
      // bound event is triggered. The callbacks for these events are evaluated within a `Sammy.EventContext`
      // This within these callbacks the special methods of `EventContext` are available.
      //
      // ### Example
      //
      //  $.sammy(function() {
      //    // The context here is this Sammy.Application
      //    this.get('#/:name', function() {
      //      // The context here is a new Sammy.EventContext
      //      if (this.params['name'] == 'sammy') {
      //        this.partial('name.html.erb', {name: 'Sammy'});
      //      } else {
      //        this.redirect('#/somewhere-else')
      //      }
      //    });
      //  });
      //
      // Initialize a new EventContext
      //
      // ### Arguments
      //
      // * `component` The `Sammy.Component` this event is called within.
      // * `verb` The verb invoked to run this context/route.
      // * `path` The string path invoked to run this context/route.
      // * `params` An Object of optional params to pass to the context. Is converted
      //   to a `Sammy.Object`.
      // * `target` a DOM element that the event that holds this context originates
      //   from. For post, put and del routes, this is the form element that triggered
      //   the route.
      //
      init: function(component, verb, path, params, target) {
        this.app    = (component != undefined) ? component.app : undefined;
        this.component = component;
        this.verb   = verb;
        this.path   = path;
        this.params = new Sammy.Object(params);
        this.target = target;
      }
    });

    // A shortcut to the app's `$element()`
    Sammy.EventContext.prototype.$element = function() {
      // @TODO change to this.component.$element()
      return this.app.$element();
    };

    // Look up a templating engine within the current app and context.
    // `engine` can be one of the following:
    //
    // * a function: should conform to `function(content, data) { return interploated; }`
    // * a template path: 'template.ejs', looks up the extension to match to
    //   the `ejs()` helper
    // * a string referering to the helper: "mustache" => `mustache()`
    //
    // If no engine is found, use the app's default `template_engine`
    //
    Sammy.EventContext.prototype.engineFor = function(engine) {
      var context = this, engine_match;
      // if path is actually an engine function just return it
      if (_isFunction(engine)) { return engine; }
      // lookup engine name by path extension
      engine = engine.toString();
      if ((engine_match = engine.match(/\.([^\.]+)$/))) {
        engine = engine_match[1];
      }
      // set the engine to the default template engine if no match is found
      if (engine && _isFunction(context[engine])) {
        return context[engine];
      }

      if (context.app.template_engine) {
        return this.engineFor(context.app.template_engine);
      }
      return function(content, data) { return content; };
    };

    // using the template `engine` found with `engineFor()`, interpolate the
    // `data` into `content`
    Sammy.EventContext.prototype.interpolate = function(content, data, engine) {
      return this.engineFor(engine).apply(this, [content, data]);
    };

    // Create and return a `Sammy.RenderContext` calling `render()` on it.
    // Loads the template and interpolate the data, however does not actual
    // place it in the DOM.
    //
    // ### Example
    //
    //      // mytemplate.mustache <div class="name">{{name}}</div>
    //      render('mytemplate.mustache', {name: 'quirkey'});
    //      // sets the `content` to <div class="name">quirkey</div>
    //      render('mytemplate.mustache', {name: 'quirkey'})
    //        .appendTo('ul');
    //      // appends the rendered content to $('ul')
    //
    Sammy.EventContext.prototype.render = function(location, data, callback) {
      return new Sammy.RenderContext(this).render(location, data, callback);
    };

    // Create and return a `Sammy.RenderContext` calling `renderEach()` on it.
    // Loads the template and interpolates the data for each item,
    // however does not actual place it in the DOM.
    //
    // ### Example
    //
    //      // mytemplate.mustache <div class="name">{{name}}</div>
    //      renderEach('mytemplate.mustache', [{name: 'quirkey'}, {name: 'endor'}])
    //      // sets the `content` to <div class="name">quirkey</div><div class="name">endor</div>
    //      renderEach('mytemplate.mustache', [{name: 'quirkey'}, {name: 'endor'}]).appendTo('ul');
    //      // appends the rendered content to $('ul')
    //
    Sammy.EventContext.prototype.renderEach = function(location, name, data, callback) {
      return new Sammy.RenderContext(this).renderEach(location, name, data, callback);
    };

    // Takes in any number of [component, 'methodName'] pairs  to be executed async/paralelly.
    // For instance, method needs to fetch data and fetch template.
    // Or it needs its components to fetch their templates and data.
    //
    // Each method gets
    //  - EventContext passed as param
    //  - callback which it needs to execute when done
    //
    // Method is expected to put rendered content into eventContext.content
    //
    // Last argument has to be callback that is executed after all functions finish.
    //
    // @param arguments[0..length-2] {function} functions to execute
    // @param arguments[length-1] {function} callback
    //
    Sammy.EventContext.prototype.renderAsync = function() {
      var args = Array.prototype.slice.call(arguments),
          callback = args.pop(),
          components = args,
          completed = 0,
          componentContext,
          context = this;

      if( components.length === 0) {
        // Execute callback in EventContext, also pass self as param (maybe not needed?..)
        callback.call(context, context);
      }

      // stuff returned by components will be stored here, indexed by component name
      context.partials = context.partials || {};

      for(var i=0; i < components.length; i++) {
    	  var elem = components[i], component = elem[0], renderer = elem[1];
        // need to create contexts for each component
        componentContext = new component.context_prototype(
        		component, 
        		context.verb, context.path, context.params, context.target);

        // Read: component[renderer](context, callback);
        component[renderer]( componentContext, function() {
          completed++;

          context.partials[component.name] = componentContext.content;

          if(completed === components.length) {
            callback.call(context, context);
          }
        });
      }
    };

    /**
     * a helper to simplify content composition from subcomponents
     * 
     * builds an array of component renderer data for renderAsync, 
     * creates a final callback to compose content, 
     * and invokes renderAsync
     * 
     * @param {jQuery} content html to compose subcomponents into
     * @param ... each subcomponent to compose into the html as a separate argument
     * @returns html composed content
     */
    Sammy.EventContext.prototype.composeAsync = function(content) {
    	var args = _makeArray(arguments), $this = this;
    	if(args.length == 1) {
    		return;
    	}
    	args.shift();
    	var passArgs = [], comps = [];
    	for(var i = 0; i < args.length; ++i) {
    		var c = args[i], component, renderer;
    		if($.isArray(c)) {
    			component = c[0];
    			renderer = c[1];
    		} else {
    			component = c;
    			renderer = 'render';
    		}
    		passArgs.push([component, renderer]);
    		comps.push(component);
    	}
    	passArgs.push(function(rc) {
    		var composeArgs = [content, rc.partials];
    		$.merge(composeArgs, comps);
			content = Sammy.Component.prototype.composeContent.apply($this, composeArgs);
			rc.swap(content);
    	});
    	this.renderAsync.apply(this, passArgs);
    };
    
    // create a new `Sammy.RenderContext` calling `load()` with `location` and
    // `options`. Called without interpolation or placement, this allows for
    // preloading/caching the templates.
    Sammy.EventContext.prototype.load = function(location, options, callback) {
      return new Sammy.RenderContext(this).load(location, options, callback);
    };

    // `render()` the the `location` with `data` and then `swap()` the
    // app's `$element` with the rendered content.
    Sammy.EventContext.prototype.partial = function(location, data) {
      return new Sammy.RenderContext(this).partial(location, data);
    };

    // create a new `Sammy.RenderContext` calling `send()` with an arbitrary
    // function
    Sammy.EventContext.prototype.send = function() {
      var rctx = new Sammy.RenderContext(this);
      return rctx.send.apply(rctx, arguments);
    };

    // Changes the location of the current window. If `to` begins with
    // '#' it only changes the document's hash. If passed more than 1 argument
    // redirect will join them together with forward slashes.
    //
    // ### Example
    //
    //      redirect('#/other/route');
    //      // equivilent to
    //      redirect('#', 'other', 'route');
    //
    Sammy.EventContext.prototype.redirect = function() {
      var to, args = _makeArray(arguments),
          current_location = this.app.getLocation();
      if (args.length > 1) {
        args.unshift('/');
        to = this.join.apply(this, args);
      } else {
        to = args[0];
      }
      this.trigger('redirect', {to: to});
      this.app.last_location = [this.verb, this.path];
      this.app.setLocation(to);
      if (current_location == to) {
        this.app.trigger('location-changed');
      }
    };

    // Triggers events on `app` within the current context.
    Sammy.EventContext.prototype.trigger = function(name, data) {
      if (typeof data == 'undefined') { data = {}; }
      if (!data.context) { data.context = this; }
      return this.component.trigger(name, data);
    };

    // A shortcut to app's `eventNamespace()`
    Sammy.EventContext.prototype.eventNamespace = function() {
      return this.app.eventNamespace();
    };

    // A shortcut to app's `swap()`
    Sammy.EventContext.prototype.swap = function(contents) {
      return this.component.swap(contents);
    };

    // Raises a possible `notFound()` error for the current path.
    Sammy.EventContext.prototype.notFound = function() {
      return this.app.notFound(this.verb, this.path);
    };

    // Default JSON parsing uses jQuery's `parseJSON()`. Include `Sammy.JSON`
    // plugin for the more conformant "crockford special".
    Sammy.EventContext.prototype.json = function(string) {
      return $.parseJSON(string);
    };

    // //=> Sammy.EventContext: get #/ {}
    Sammy.EventContext.prototype.toString = function() {
      return "Sammy.EventContext: " + [this.verb, this.path, this.params].join(' ');
    };

  })();

  (function() {
    Sammy.Event = function(){};

    Sammy.Event = Sammy.Class.extend({
      /**
       * @param type {String}
       * @param target {Sammy.Component} event originator
       */
      init: function(type, target) {
        this.type = type;
        this.target = target;
        this.originalTarget = target;
        // Whether event should be propagated to its parent
        this.isPropagationStopped = false;
        // whether other listeners should be triggered
        this.isImmediatePropagationStopped = false;
      }
    });
    
    Sammy.Event.prototype.stopPropagation = function() {
      this.isPropagationStopped = true;
    };

    Sammy.Event.prototype.stopImmediatePropagation = function() {
      this.isImmediatePropagationStopped = true;
    };
  })();
  
  // An alias to Sammy
  $.sammy = window.Sammy = Sammy;

})(jQuery, window);
