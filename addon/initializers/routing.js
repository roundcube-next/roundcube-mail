export function initialize(application) {
  // Access the application router and register mail routes
  var router = application.resolve('router:main');

  router.map(function () {
    this.route('shell', { path: '/' }, function () {
      this.route('mail', { path: '/mail' }, function () {
        this.route('index', { path: '/' });
        this.route('mailbox', { path: '/:mailbox_name'}, function () {
          this.route('message', { path: '/:message_id' });
        });
      });
    });
  });
}

export default {
  name: 'routing',
  initialize
};
