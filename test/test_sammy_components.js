(function($) {
  // $(function() {
  with(QUnit) {

    context('Sammy', 'inheritance')
    .should('deal ok with super methods', function() {
      var context = this;
      var Foo = Sammy.Class.extend({
        foo: function(){
          context.Foo = true;
        },
        bar: function() {
          context.Bar = true;
        }
      });
      var FooFoo = Foo.extend({
        init: function() {
          this.foo();
        },
        foo: function(){
          context.FooFoo = true;
          this.bar();
        },
        bar: function() {
          context.BarBar = true;
          this._super();
        }
      });
      var f = new FooFoo();
      ok(context.FooFoo);
      ok(!context.Foo); // because FooFoo.foo doesn't call its  super method
      ok(context.BarBar);
      ok(context.Bar);
    });

    context('Sammy.Component', 'app component', {
      before: function() {
        this.a = new Sammy.Application(function(app){
          this.debug = true;
        });
      }
    })
    .should('have no parent', function() {
      ok(this.a.parent == null);
    })
    .should('have name sammy-app', function(){
      equal(this.a.name, 'sammy-app');
    })
    .should('have property app which is itself', function(){
      same(this.a.app.namespace, this.a.namespace); // deep compare gets into a loop
    });

    context('Sammy.Component','components', {
      before: function() {
        this.app = new Sammy.Application();
        this.comp = this.app.createComponent('comp');
      }
    })
    .should('create and return a component', function() {
      ok(this.comp.namespace); // if namespace defined, component is too
      ok(this.app.components['comp'] != undefined);
      equal(this.app.components['comp'].namespace, this.comp.namespace);
      equal(this.comp.name, 'comp');
      equal( this.app.components['comp'].name, 'comp');
    })
    .should('return component by name', function() {
      same(this.comp.namespace, this.app.getComponent('comp').namespace);
    })
    .should('have app as parent', function() {
      same(this.comp.parent.namespace, this.app.namespace);
    })
    .should('have app set', function() {
      same(this.comp.app.namespace, this.app.namespace);
    })
    .should('have separate event space', function(){
      ok(this.comp.namespace != this.app.namespace);
    })
    .should('have event namespace inside parent\'s namespace', function() {
      ok(this.comp.eventNamespace().indexOf(this.app.eventNamespace()) == 0);
      ok(this.comp.eventNamespace().indexOf(this.comp.namespace) > -1);
      ok(this.comp.eventNamespace().indexOf(this.comp.name) > -1);
    })
    .should('remove component', function() {
      this.app.createComponent('bar');
      this.app.removeComponent('bar');
      ok(this.app.components['bar'] == undefined);
    })
    .should('remove all listeners when removing a component', function() {
      var bar = this.app.createComponent('bar');
      this.app.bind('brr', function(){});
      bar.bind('foo', function(){});
      bar.bind('bar', function(){});
      this.app.bind('bash', function(){});
      this.app.removeComponent('bar');
      equal(typeof this.app._listeners[this.app.eventNamespace() + '.' + 'brr'], 'object');
      equal(typeof this.app._listeners[this.app.eventNamespace() + '.' + 'bash'], 'object');
      equal(typeof this.app._listeners[bar.eventNamespace() + '.' + 'foo'], 'undefined');
      equal(typeof this.app._listeners[bar.eventNamespace() + '.' + 'bar'], 'undefined');
    });

    context('Sammy.Component','nested components', {
      before: function() {
        this.app = new Sammy.Application();
        this.comp = this.app.createComponent('comp');
        this.subcomp = this.comp.createComponent('subcomp');
      }
    })
    .should('be able to create subcomponent', function() {
      ok(this.subcomp.namespace); // if namespace defined, component is too
      ok(this.comp.components['subcomp'] != undefined);
      equal(this.comp.components['subcomp'].namespace, this.subcomp.namespace);
      equal(this.subcomp.name, 'subcomp');
      equal( this.comp.components['subcomp'].name, 'subcomp');
    })
    .should('have app set', function() {
      same(this.subcomp.app.namespace, this.app.namespace);
    })
    .should('have parent component set as parent', function() {
      same(this.subcomp.parent.namespace, this.comp.namespace);
    })
    .should('have separate event space', function(){
      ok(this.subcomp.namespace != this.app.namespace);
      ok(this.subcomp.namespace != this.comp.namespace);
    })
    .should('have event namespace inside parent\'s namespace', function() {
      ok(this.subcomp.eventNamespace().indexOf(this.app.eventNamespace()) == 0);
      ok(this.subcomp.eventNamespace().indexOf(this.comp.eventNamespace()) > -1);
      ok(this.subcomp.eventNamespace().indexOf(this.subcomp.namespace) > -1);
      ok(this.subcomp.eventNamespace().indexOf(this.subcomp.name) > -1);
    });

    context('Sammy.Component', 'events', {
      before: function() {
        this.app = new Sammy.Application();
        this.comp = this.app.createComponent('comp');
        this.subcomp = this.comp.createComponent('subcomp');
      },
      after: function() {
        delete this.triggered;
      }
    })
    .should('be able to bind events', function() {
      var context = this;
      this.app.run();
      this.subcomp.bind('foo', function(){
        context.triggered = 'subcomp:foo';
      });
      this.subcomp.trigger('foo');
      equal(this.triggered, 'subcomp:foo');
      this.app.unload();
    })
    .should('not raise event if app is not running', function() {
      var context = this;
      this.comp.bind('foo', function(){
        context.triggered = 'comp:foo';
      });
      this.comp.trigger('foo');
      equal(this.triggered, undefined);
    })
    .should('propagate event to parent', function() {
      var context = this;
      this.comp.bind('foo', function(){
        context.foo = 'comp:foo';
      });
      this.subcomp.bind('foo', function(){
        context.foo = 'subcomp:foo';
      });

      this.subcomp.bind('bar', function(){
        context.bar = 'subcomp:bar';
      });
      this.app.bind('bar', function(){
        context.bar = 'app:bar';
      });

      this.app.run();
      this.subcomp.trigger('foo');
      equal(this.foo, 'comp:foo');

      this.subcomp.trigger('bar');
      equal(this.bar, 'app:bar');

      this.app.unload();
    })
    .should('not propagate event to child', function() {
      var context = this;
      this.comp.bind('foo', function(){
        context.triggered = 'comp:foo';
      });
      this.subcomp.bind('foo', function(){
        context.triggered = 'subcomp:foo';
      });
      this.app.run();
      this.comp.trigger('foo');
      equal(this.triggered, 'comp:foo');
      this.app.unload();
    })
    .should('be able to stop propagation by returning false', function() {
      var context = this;
      this.app.run();

      this.subcomp.bind('foo', function(){
        context.triggered = 'subcomp:foo';
        return false;
      });

      this.subcomp.bind('foo', function(){
        context.triggered = 'subcomp:foo:3';
      });

      this.subcomp.trigger('foo');
      equal(this.triggered, 'subcomp:foo');
      this.app.unload();
    })
    .should('be able to stop propagation to parent', function() {
      var context = this;
      this.app.run();
      this.subcomp.bind('foo', function(e){
        context.triggered = 'subcomp:foo';
        e.stopPropagation();
      });
      this.comp.bind('foo', function(){
        context.triggered = 'comp:foo';
      });

      this.subcomp.trigger('foo');
      equal(this.triggered, 'subcomp:foo');
      this.app.unload();
    })
    .should('be able to stop propagation other listeners', function() {
      var context = this;
      this.app.run();
      this.subcomp.bind('bash', function(e){
        context.triggered = 'subcomp:bash';
        e.stopImmediatePropagation();
      });
      this.subcomp.bind('bash', function(e){
        context.triggered = 'subcomp:bash:3';
      });

      this.subcomp.trigger('bash');
      equal(this.triggered, 'subcomp:bash');
      this.app.unload();
    })
    .should('be able to stop propagation other listeners, but allow event to propagate to parent', function() {
      var context = this;
      this.app.run();
      this.subcomp.bind('bash', function(e){
        e.stopImmediatePropagation();
      });
      this.subcomp.bind('bash', function(e){
        context.triggeredSubcomp = true;
      });
      this.comp.bind('bash', function(e){
        context.triggeredComp = true;
      });

      this.subcomp.trigger('bash');
      ok(this.triggeredComp);
      ok(!context.triggeredSubcomp);
      this.app.unload();
    })
    .should('have event target set to originator', function() {
      var context = this;
      this.app.run();
      this.subcomp.bind('bash', function(e){
        equals(e.target.namespace, context.subcomp.namespace);
      });
      this.subcomp.trigger('bash');
      this.app.unload();
    })
    .should('retain original target when propagating', function() {
      var context = this;
      this.app.run();
      this.subcomp.bind('bash', function(e){
      });
      this.comp.bind('bash', function(e){
        equals(e.originalTarget.namespace, context.subcomp.namespace);
      });
      this.subcomp.trigger('bash');
      this.app.unload();
    })
    .should('have target reset when propagating', function() {
      var context = this;
      this.app.run();
      this.subcomp.bind('bash', function(e){
      });
      this.comp.bind('bash', function(e){
        equals(e.target.namespace, context.comp.namespace);
      });
      this.subcomp.trigger('bash');
      this.app.unload();
    })
    .should('bind to all component events that are already being listed to', function(){
      var context = this;
      this.app.run();
      this.subcomp.bind('bash', function(e){

      });
      this.subcomp.bind('bar', function(e){

      });
      this.subcomp.bindToAllEvents(function(e){
        context[e.type] = true;
      });
      this.subcomp.trigger('bash');
      this.subcomp.trigger('bar');
      ok(context.bash);
      ok(context.bar);
      this.app.unload();
    });

    context('Sammy.Component','helpers', {
      before: function() {
        var context = this;
        var comp = function(){
          this.get('#/', function() {
            this.params['belch'] = 'boosh';
            context.event_context = this;
          });

          this.bind('blurgh', function() {
            context.event_context = this;
          });

          this.helpers({
            helpme: function() {
              return "halp!";
            }
          });
        };
        context.event_context = null;
        this.app = new Sammy.Application(function() {
          context.comp = this.createComponent('comp', comp);
        });
      }
    })
    .should('extend event context for routes', function() {
      var context = this;
      this.app.run('#/');
      soon(function() {
        ok(context['event_context']);
        isType(context.event_context.helpme, 'Function');
        this.app.unload();
      }, this, 2, 2);
    })
    .should('extend event context for bind', function() {
      var context = this;
      this.app.run('#/');
      this.comp.trigger('blurgh');
      soon(function() {
        ok(context['event_context']);
        isType(context.event_context.helpme, 'Function');
        this.app.unload();
      }, this, 2, 2);
    });

    context('Sammy.Component','helper', {
      before: function() {
        var context = this;
        context.event_context = null;
        this.app = new Sammy.Application(function() {
          context.comp = this.createComponent('comp', function(){
            this.helper(
              "helpme", function() {
                return "halp!";
              }
            );

            this.get('#/', function() {
              this.params['belch'] = 'boosh';
              context.event_context = this;
            });

            this.bind('blurgh', function() {
              context.event_context = this;
            });
          });
        });
      }
    })
    .should('extend event context for routes', function() {
      var context = this;
      this.app.run('#/');
      soon(function() {
        ok(context['event_context']);
        isType(context.event_context.helpme, 'Function');
        this.app.unload();
      }, this, 2, 2);
    })
    .should('extend event context for bind', function() {
      var context = this;
      this.app.run('#/');
      this.comp.trigger('blurgh');
      soon(function() {
        ok(context['event_context']);
        isType(context.event_context.helpme, 'Function');
        this.app.unload();
      }, this, 2, 2);
    });
  }
})(jQuery);