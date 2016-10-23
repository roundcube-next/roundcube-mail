import Ember from 'ember';
import _ from 'lodash';

export default Ember.Route.extend({
  pubsub: Ember.inject.service(),

  queryParams: {
    pos: {
      replace: true
    }
  },

  cachedModel: null,

  actions: {
    loadPage(before) {
      let cachedModel = this.get('cachedModel');
      if (cachedModel && cachedModel.mailboxId) {
        var mailbox = _.find(this.modelFor('shell.mail'), {id: cachedModel.mailboxId});
        var pos = before ? cachedModel.loadPosition - cachedModel.limit : cachedModel.position + cachedModel.limit;
        this.getMessageList(mailbox, pos)
          .then((result) => {
            return this.mergeResult(result);
          });
      }
    }
  },

  /**
   * @param {params.mailbox_id} The numeric ID of the mailbox or mailbox role ('inbox', 'archive')
   * @param {params.pos} The offset of the message listing
   */
  model(params) {
    var mailboxId = params.mailbox_id,
        mailboxes = this.modelFor('shell.mail'),
        pubsub = this.get('pubsub'),
        position = params.pos || 0;

    return new Ember.RSVP.Promise((resolve, reject) => {
      var mailbox = _.find(mailboxes, function(mbox) {
        return mbox.role.value === mailboxId || mbox.id === mailboxId;
      });
      if (!mailbox) {
        pubsub.trigger('shell.notify', 'No mailbox found by that name');
        return reject();
      }

      // TODO: Need design input before we add ways to fetch more messages
      return this.getMessageList(mailbox, position)
        .then((result) => {
          this.set('cachedModel', result);
          resolve(result);
        })
        .catch(reject);
    });
  },

  /**
   *
   */
  getMessageList(mailbox, pos) {
    const pageSize = 50;

    return mailbox.getMessageList({
      sort: 'date desc',
      collapseThreads: true,
      fetchMessages: true,
      fetchMessageProperties: ['threadId', 'mailboxIds', 'from', 'subject', 'date', 'preview'],
      position: pos,
      limit: pageSize
    }).then((response) => {
      let result = response.length ? response[0] : {total: 0};
      result.messages = response.length ? response[1] : [];
      result.mailboxId = mailbox.id;
      result.limit = pageSize;
      result.loadPosition = result.position;

      // wrap result in an Ember.Object
      return Ember.Object.create(result);
    });
  },

  /**
   *
   */
  mergeResult(result) {
    let cachedModel = this.get('cachedModel');

    if (!cachedModel) {
      return result;
    }

    let insertBefore = result.position < cachedModel.position;

    if (insertBefore) {
      cachedModel.set('messages', result.messages.concat(cachedModel.messages));
      cachedModel.set('loadPosition', result.position);
    } else {
      cachedModel.set('messages', cachedModel.messages.concat(result.messages));
      cachedModel.set('position', result.position);
    }

//    cachedModel.set('threadIds', cachedModel.messageIds.concat(result.threadIds));
//    cachedModel.set('messageIds', cachedModel.messageIds.concat(result.messageIds));

    return cachedModel;
  }
});
