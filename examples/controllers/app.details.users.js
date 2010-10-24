var app = app || {};
app.details = app.details || {};
app.details.users = function() {

  // Would be nice to have smth like
  // /#.*\/users
  // Meaning: whatever it is, if it ends with users, I can show it
  this.get('#/sips/control/:id/details/users', function() {
    this.app.log('rendering users');
    $.template('details-extended', $('#tpl-details-extended'));
    return $($.tmpl('details-extended', {name: 'Users'}));
  });
};