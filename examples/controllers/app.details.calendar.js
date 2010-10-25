var app = app || {};
app.details = app.details || {};
app.details.calendar = function() {

  this.get(/#.*\/calendar/, function() {
    this.app.log('rendering calendar');
    $.template('details-extended', $('#tpl-details-extended'));
    this.content = $($.tmpl('details-extended', {name: 'Calendar'}));

    this.trigger('rendering done'); // will pass data.context by itself
  });

};