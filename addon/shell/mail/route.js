import Ember from 'ember';
import _ from 'lodash';

export default Ember.Route.extend({
  model() {
    return this.modelFor('shell').getMailboxes()
      .then(function(mailboxes) {
        if (!mailboxes.length) {
          mailboxes = [];
        }

        // sort mailbox list
        mailboxes.sort(function(a, b) {
          var s = a.sortOrder - b.sortOrder;
          if (s === 0) {
            s = a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
          }
          return s;
        });

        return mailboxes;
      });
  },

  redirect: function(model, transition) {
    if (transition.targetName === 'shell.mail.index') {
      var inboxId = _.result(_.find(model, function(mailbox) {
        return mailbox.role && mailbox.role.value === 'inbox';
      }), 'id');

      // If a mailbox with the role 'inbox' is found, redirect to it by default
      if (inboxId) {
        this.transitionTo('shell.mail.mailbox', inboxId);
      }
    }
  },

  actions: {
    willTransition: function (transition) {
      this.redirect(this.context, transition);
    }
  }
});
