import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/shared/Logger';
import manifest from '../../../../manifest.json';

export const saveDiagnosticData = createAction({
  name: 'saveDiagnosticData',
  handler() {
    const logger = this.di.inject(loggerToken);
    const messages = logger.getMessages();

    const html = window.document.body.innerHTML;

    const jiraVersion = document.body.getAttribute('data-version');

    const { href } = window.location;

    const payload = {
      messages,
      html,
      href,
      pluginVersion: manifest.version,
      jiraVersion,
    };

    // Создание JSON-файла с логами и HTML
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Создание ссылки для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic_data_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();

    // Очистка URL-объекта
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
});
