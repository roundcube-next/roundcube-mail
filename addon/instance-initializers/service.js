export function initialize(instance) {
  var apps = instance.container.lookup('service:apps'),
      i18n = instance.container.lookup('service:i18n');

  apps.register(i18n.t('mail.appName'), 'shell.mail');
}

export default {
  name: 'routing',
  initialize
};
