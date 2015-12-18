/*globals escape*/

import Ember from 'ember';

export function prettify(params) {
  return decodeURIComponent(escape(params[0]));
}

export default Ember.Helper.helper(prettify);
