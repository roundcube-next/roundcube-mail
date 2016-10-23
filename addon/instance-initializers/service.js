export function initialize(instance) {
  var apps = instance.lookup('service:apps'),
      i18n = instance.lookup('service:intl');

  apps.register('mail.appName', 'shell.mail');
}

export default {
  name: 'routing',
  initialize
};
