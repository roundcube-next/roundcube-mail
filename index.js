/* jshint node: true */
'use strict';

var mergeTrees = require('broccoli-merge-trees');
var path = require('path');

var deps = [
  ['dompurify/dist', 'purify.min.js']
].map(function (dep) {
  return {
    dir: path.join(__dirname, 'bower_components', dep[0]),
    js: path.join('vendor', dep[1])
  };
});

module.exports = {
  name: 'roundcube-mail',
  isDevelopingAddon: function() {
    return true;
  },
  treeForVendor: function (tree) {
    var trees = [tree];

    deps.forEach(function (dep) {
      trees.push(dep.dir);
    });

    return mergeTrees(trees);
  },
  included: function (app) {
    this._super.included(app);

    deps.forEach(function (dep) {
      app.import(dep.js);
    });
  }
};
