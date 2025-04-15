import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/shared/Logger';
import manifest from '../../../../manifest.json';

export const saveDiagnosticData = createAction({
  name: 'saveDiagnosticData',
  handler() {
    const logger = this.di.inject(loggerToken);
    const messages = logger.getMessages();

    const html = window.document.body.innerHTML || 'unable to retrieve html';

    const jiraVersion = document.body.getAttribute('data-version') || 'unknown';

    const { href } = window.location;

    const payload = {
      messages,
      html,
      href,
      pluginVersion: manifest.version,
      jiraVersion,
    };

    // create json file with logs and html
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // create link for download
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic_data_${new Date().toISOString().replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();

    // clean up url object
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
});
