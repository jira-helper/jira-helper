import { Token } from 'dioma';
import { PageModification } from 'src/infrastructure/page-modification/PageModification';
import { registerIssueSettings } from 'src/issue-settings/actions/registerIssueSettings';
import { loadLocalSettings } from './actions/loadLocalSettings';
import { LocalSettingsTab } from './components/LocalSettingsTab';

/**
 * Registers the Local Settings tab in the issue-view Issue Settings modal,
 * mirroring how `LocalSettingsBoardPage` registers it in the board-level settings.
 * Mounting the actual modal is owned by whichever feature inserts the toolbar
 * button (currently `GanttChartIssuePage`), so this page only contributes the tab.
 */
export class LocalSettingsIssuePage extends PageModification<void, Element> {
  getModificationId(): string {
    return 'local-settings-issue-page';
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('#details-module');
  }

  loadData(): Promise<void> {
    return loadLocalSettings().then(() => undefined);
  }

  apply(): void {
    registerIssueSettings({
      title: 'Local Settings',
      component: LocalSettingsTab,
    });
  }
}

export const localSettingsIssuePageToken = new Token<LocalSettingsIssuePage>('LocalSettingsIssuePage');
