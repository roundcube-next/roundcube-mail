import Ember from 'ember';
import _ from 'lodash';

export default Ember.Route.extend({
  /**
   * @param {params.mailbox_id} The name of the mailbox ('Inbox', 'Archives')
   */
  model(params) {
    var mailboxId = params.mailbox_id,
        mailboxes = this.modelFor('shell.mail');

    return new Ember.RSVP.Promise(function (resolve, reject) {
      var mailbox = _.find(mailboxes, function(mbox) {
        return mbox.role.value === mailboxId || mbox.id === mailboxId;
      });
      if (!mailbox) {
        console.error('No mailbox by that name found.');
        return reject();
      }

      // TODO: Need design input before we add ways to fetch more messages
      mailbox.getMessageList({
        sort: 'date desc',
        collapseThreads: true,
        fetchMessages: true,
        limit: 50
      }).then(function (response) {
        let messages = response.length ? response[1] : [];
        resolve(messages);
      }, reject);
    });
  }
});
