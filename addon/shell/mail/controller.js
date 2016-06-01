import Ember from 'ember';
import _ from 'lodash';

export default Ember.Controller.extend({
  mailboxtree: Ember.computed('model', function() {
    // build index by id
    let index = {};
    _.each(this.model, function(mbox) {
      mbox.children = [];
      index[mbox.id] = mbox;
    });

    // build mailbox tree structure
    let root = [];
    _.each(this.model, function(mbox) {
      if (mbox.parentId) {
        if (index[mbox.parentId]) {
          index[mbox.parentId].children.push(mbox);
        }
        else {
          // parent node was probably filtered by server so let's just ignore its childs
          // throw new Error("Invalid mailbox parentId reference: " + mbox.parentId);
        }
      }
      else {
        root.push(mbox);
      }
    });

    return root;
  })
});