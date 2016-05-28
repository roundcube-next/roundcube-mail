import Ember from 'ember';
import layout from './template';
import htmlSanitizer from 'roundcube-mail/utils/html-sanitizer';

export default Ember.Component.extend({
  layout: layout,

  analysis: {},
  options: {},
  content: '',

  showImagesWarning: Ember.computed('analysis', 'options', function() {
    return this.get('analysis.imagesPresent') && !this.get('options.imagesAllowed');
  }),
  generatedContent: Ember.computed('content', function () {
    return this.get('content');
  }),

  generate: function () {
    if (this.message.htmlBody) {
      let { content, analysis }
      = htmlSanitizer(this.message.htmlBody, this.get('options'));

      this.set('content', content);
      this.set('analysis', analysis);
    } else {
      let content = document.createElement('pre');
      content.innerText = this.message.textBody;
      this.set('content', content);
    }
  },

  messageChanged: function () {
    this.set('analysis', {});
    this.set('options.imagesAllowed', false);
    this.generate();
  }.observes('message'),

  initialized: function () {
    this.messageChanged();
  }.on('init'),

  actions: {
    showImages() {
      this.set('options.imagesAllowed', true);
      this.generate();
    }
  }
});
