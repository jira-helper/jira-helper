import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Token } from 'dioma';
import { PageModification } from 'src/infrastructure/page-modification/PageModification';
import { WithDi } from 'src/infrastructure/di/diContext';
import { routingServiceToken } from 'src/infrastructure/routing';
import { registerIssueSettings } from 'src/issue-settings/actions/registerIssueSettings';
import { IssueSettingsComponent } from 'src/issue-settings/IssueSettingsComponent';
import { ganttChartModule } from '../module';
import { ganttSettingsModelToken, issueViewPageObjectToken } from '../tokens';
import { applyInitialGanttScopeForIssueView } from '../utils/applyInitialGanttScopeForIssueView';
import { CollapsibleGanttSection } from './components/CollapsibleGanttSection';
import { GanttSettingsTab } from './components/GanttSettingsTab';

export type GanttChartIssuePageInitData = {
  issueKey: string;
};

/**
 * PageModification for Jira issue view: inserts collapsible Gantt section after #attachmentmodule,
 * adds a settings button to .aui-toolbar2-secondary, and registers a Gantt tab in Issue Settings.
 */
export class GanttChartIssuePage extends PageModification<GanttChartIssuePageInitData | undefined, Element> {
  private get routing() {
    return this.container.inject(routingServiceToken);
  }

  shouldApply(): boolean {
    return this.routing.getIssueId() != null;
  }

  getModificationId(): string {
    return 'gantt-chart-issue-page';
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('#details-module');
  }

  loadData(): Promise<GanttChartIssuePageInitData | undefined> {
    ganttChartModule.ensure(this.container);
    const issueKey = this.routing.getIssueId() ?? this.getIssueKeyFromDocument();
    if (!issueKey) {
      return Promise.resolve(undefined);
    }

    const { model } = this.container.inject(ganttSettingsModelToken);
    model.load();

    const projectKey = this.routing.getProjectKeyFromURL() ?? this.projectKeyFromIssueKey(issueKey);
    const pageObject = this.container.inject(issueViewPageObjectToken);
    model.contextProjectKey = projectKey;
    model.contextIssueType = pageObject.getIssueType() ?? '';
    applyInitialGanttScopeForIssueView(model);

    return Promise.resolve({ issueKey });
  }

  private getIssueKeyFromDocument(): string | null {
    const withHyphenAttr = document.querySelector('[data-issue-key]');
    if (withHyphenAttr) return withHyphenAttr.getAttribute('data-issue-key');
    const legacy = document.querySelector('[data-issuekey]');
    return legacy?.getAttribute('data-issuekey') ?? null;
  }

  private projectKeyFromIssueKey(issueKey: string): string {
    const m = issueKey.match(/^(.+)-(\d+)$/);
    return m ? m[1]! : issueKey;
  }

  apply(data?: GanttChartIssuePageInitData): void {
    ganttChartModule.ensure(this.container);
    const { model } = this.container.inject(ganttSettingsModelToken);
    model.load();

    registerIssueSettings({ title: 'Gantt Chart', component: GanttSettingsTab });

    const pageObject = this.container.inject(issueViewPageObjectToken);

    // Toolbar button → tabbed Issue Settings modal
    const toolbarHost = pageObject.insertToolbarButton();
    if (toolbarHost) {
      const toolbarRoot = createRoot(toolbarHost);
      flushSync(() => {
        toolbarRoot.render(React.createElement(IssueSettingsComponent));
      });
      this.sideEffects.push(() => {
        toolbarRoot.unmount();
        pageObject.removeToolbarButton();
      });
    }

    const sectionContent = pageObject.addSectionInMainFlow('gantt-chart');
    if (!sectionContent) return;

    const issueKey = data?.issueKey ?? this.routing.getIssueId() ?? this.getIssueKeyFromDocument() ?? '';

    const chartRoot = createRoot(sectionContent);
    flushSync(() => {
      chartRoot.render(
        React.createElement(
          WithDi,
          { container: this.container },
          React.createElement(CollapsibleGanttSection, { issueKey, container: this.container })
        )
      );
    });

    this.sideEffects.push(() => {
      chartRoot.unmount();
      pageObject.removeSectionInMainFlow('gantt-chart');
    });
  }
}

export const ganttChartIssuePageToken = new Token<GanttChartIssuePage>('GanttChartIssuePage');
