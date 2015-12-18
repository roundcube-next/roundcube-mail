import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    let messages = this.modelFor('shell.mail.mailbox'),
        message = _.find(messages, _.matchesProperty('id', params.messageId));

    return message;
  }
});
