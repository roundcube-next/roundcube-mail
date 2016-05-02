module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    // register bower dependency in parent project
    return this.addBowerPackageToProject('dompurify');
  }
};