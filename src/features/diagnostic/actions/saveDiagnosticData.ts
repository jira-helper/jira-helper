import { BoardPagePageObject, boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/shared/Logger';

export const saveDiagnosticData = createAction({
  name: 'saveDiagnosticData',
  handler() {
    const logger = this.di.inject(loggerToken);
    const pageObject = this.di.inject(boardPagePageObjectToken);
    const messages = logger.getMessages();

    const html = pageObject.getHtml();

    const { href } = window.location;

    const payload = {
      messages,
      html,
      href,
      // TODO:
      pluginVersion: '1.1.1',
      jiraVersion: 'jira-server 8',
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
