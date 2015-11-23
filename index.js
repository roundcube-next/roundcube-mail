/* jshint node: true */
'use strict';

module.exports = {
  name: 'roundcube-mail',
  isDevelopingAddon: function() {
    return true;
  },
  included: function (app) {
    this._super.included(app);
  }
};
