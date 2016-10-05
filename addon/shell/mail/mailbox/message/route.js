import Ember from 'ember';
import _ from 'lodash';

export default Ember.Route.extend({
  pubsub: Ember.inject.service(),
  jmap: Ember.inject.service(),

  model(params) {
    var pubsub = this.get('pubsub'),
      jmapClient = this.get('jmap').client,
      messages = this.modelFor('shell.mail.mailbox').messages,
      message = _.find(messages,{id: params.message_id});

    if (message && (message.htmlBody || message.textBody)) {
      return Ember.Object.create(message);
    } else if (message) {
      message = Ember.Object.create(message);

      // fetch the full message asynchronously...
      jmapClient.getMessages({ids: [params.message_id]})
        .then((response) => {
          message.setProperties(response[0]);
        })
        .catch((err) => {
          pubsub.trigger('shell.notify', 'Message not found: ' + err.message);
        });

      // ...but resolve immediately with partial message model
      return message;
    } else {
      // fetch message from server if not found in the current message listing
      return jmapClient.getMessages({ids: [params.message_id]})
        .then((response) => {
          if (!response || !response.length) {
            throw new Error('Invalid message ID');
          }
          return response[0];
        })
        .catch((err) => {
          pubsub.trigger('shell.notify', 'Message not found: ' + err.message);
          return {};
        });
    }
  }
});
