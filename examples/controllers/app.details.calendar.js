var app = app || {};
app.details = app.details || {};
app.details.calendar = function() {

  this.get(/#.*\/calendar/, function() {
    var context = this;
    context.app.log('rendering calendar');
    $.template('details-extended', $('#tpl-details-extended'));
    context.content = $($.tmpl('details-extended', {name: 'Calendar'}));

    $.get('ping.php', function(){
      context.trigger('rendering done'); // will pass data.context by itself
    });
  });

};