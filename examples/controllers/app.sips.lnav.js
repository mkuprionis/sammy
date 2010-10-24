var app = app || {};
app.sips = app.sips || {};
app.sips.lnav = function() {
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