export function initialize(instance) {
  var apps = instance.lookup('service:apps');

  apps.register('mail.appName', 'shell.mail');
}

export default {
  name: 'routing',
  initialize
};
