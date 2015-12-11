import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout: layout,
  imagesAllowed: true,
  actions: {
    showImages() {
      this.set('imagesAllowed', true);
    }
  }
});
