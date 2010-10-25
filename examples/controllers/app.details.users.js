var app = app || {};
app.details = app.details || {};
app.details.users = function() {

  // Would be nice to have smth like
  // /#.*\/users
  // Meaning: whatever it is, if it ends with users, I can show it
  this.get('#/sips/control/:id/details/users', function() {
    var context = this;
    $.template('details-extended', $('#tpl-details-extended'));
    context.content = $($.tmpl('details-extended', {name: 'Users'}));

    // long async operation
    var ping = function(callback) {
      $.get('ping.php', callback);
    }
    
    // Nice trick, but seems to me it blocks execution
    // other way of doing this in aoo,details.calendar.js
    this.send(ping).then(function(resp){
      context.log('users rendered');
      context.trigger('rendering done'); // will pass data.context by itself
    });

    this.log('users route handler returns');

    // {return and trigger event-context-after}
    // this happens before ajax call is done
  });
};