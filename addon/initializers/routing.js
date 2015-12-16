export function initialize(application) {
  var router = application.resolve('router:main'),
      apps = application.lookup('service:apps'),
      i18n = application.lookup('service:i18n');

  // Register all routes on the application router
  router.map(function () {
    this.route('shell', { path: '/' }, function () {
      this.route('mail', { path: '/mail' }, function () {
        this.route('mailbox', { path: '/:mailbox_name'}, function () {
          this.route('message', { path: '/:message_id' });
        });
      });
    });
  });

  apps.register(i18n.t('mail.appName'), 'shell.mail');
}

export default {
  name: 'routing',
  initialize
};
