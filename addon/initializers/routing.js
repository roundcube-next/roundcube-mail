export function initialize(application) {
  let router = application.resolve('router:main'),
      apps = application.lookup('service:apps'),
      i18n = application.lookup('service:i18n');

  // Register all routes on the application router
  router.map(function() {
    this.route('shell', { path: '/' }, function() {
      this.route('mail', { path: '/mail' }, function() {
        this.route('mailbox', { path: '/:mailboxName' }, function() {
          this.route('message', { path: '/:messageId' });
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
