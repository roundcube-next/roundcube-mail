import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['pos'],
  pos: 0,

  messages: Ember.computed('model.messages', function() {
    this.set('pos', this.model.position);
    return this.model.messages;
  }),

  nextPage: Ember.computed('model.position', function() {
    let page = Math.floor(this.model.position / this.model.limit) + 1;
    let numPages = Math.ceil(this.model.total / this.model.limit);
    return page < numPages ? page + 1 : false;
  }),

  prevPage: Ember.computed('model.loadPosition', function() {
    let max = Math.min(this.model.total, this.model.position + this.model.limit);
    return this.model.loadPosition > 0 && this.model.messages.length < max;
  })
});