import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    var messages = this.modelFor('shell.mail.mailbox'),
        message = _.find(messages, _.matchesProperty('id', params.message_id));
  
    return message;
  }
});
