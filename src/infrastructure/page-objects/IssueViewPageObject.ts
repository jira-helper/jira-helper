/**
 * @module IssueViewPageObject
 *
 * Monopoly on DOM operations for the Jira issue view page.
 * DOM-only — no React and no feature-specific selectors.
 */

export interface IIssueViewPageObject {
  readonly selectors: {
    readonly detailsBlock: string;
    readonly issueType: string;
    readonly attachmentModule: string;
    readonly toolbar2Secondary: string;
    readonly toolbarButton: string;
  };
  getIssueType(): string | null;
  /**
   * Create a container div in the main issue flow after `#attachmentmodule`.
   * Falls back to after `#details-module` if attachments module is absent.
   * Returns the container where React can mount, or null.
   */
  addSectionInMainFlow(id: string): HTMLElement | null;
  /** Remove a section previously created by {@link addSectionInMainFlow}. */
  removeSectionInMainFlow(id: string): void;
  /** Append a host element as the last child of `.aui-toolbar2-secondary`. Returns the host or null. */
  insertToolbarButton(): HTMLElement | null;
  /** Remove toolbar button host. */
  removeToolbarButton(): void;
}

export class IssueViewPageObject implements IIssueViewPageObject {
  readonly selectors = {
    detailsBlock: '#details-module',
    issueType: '#type-val',
    attachmentModule: '#attachmentmodule',
    toolbar2Secondary: '.aui-toolbar2-secondary',
    toolbarButton: '[data-jh-component="issueSettingsHost"]',
  } as const;

  getIssueType(): string | null {
    const el = document.querySelector(this.selectors.issueType) as HTMLElement | null;
    if (!el) return null;
    return el.textContent?.trim() || null;
  }

  addSectionInMainFlow(id: string): HTMLElement | null {
    const sectionSelector = `[data-jh-section="${id}"]`;
    const existing = document.querySelector(sectionSelector);
    if (existing) return existing as HTMLElement;

    const anchor =
      document.querySelector(this.selectors.attachmentModule) ?? document.querySelector(this.selectors.detailsBlock);
    if (!anchor) return null;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-jh-section', id);
    anchor.insertAdjacentElement('afterend', wrapper);

    return wrapper;
  }

  removeSectionInMainFlow(id: string): void {
    document.querySelectorAll(`[data-jh-section="${id}"]`).forEach(el => el.remove());
  }

  insertToolbarButton(): HTMLElement | null {
    const existing = document.querySelector(this.selectors.toolbarButton);
    if (existing) return existing as HTMLElement;

    const toolbar = document.querySelector(this.selectors.toolbar2Secondary);
    if (!toolbar) return null;

    /**
     * `.aui-toolbar2-secondary` is a `<div>` whose children are inline `aui-buttons` groups.
     * A plain `<div>` host falls onto its own line (this caused the previous icon to render
     * below the toolbar). Use a `<span>` with inline-flex so the React-rendered
     * `<button class="aui-button">` sits in the same row as Share / Export / >>.
     */
    const host = document.createElement('span');
    host.setAttribute('data-jh-component', 'issueSettingsHost');
    host.style.display = 'inline-flex';
    host.style.alignItems = 'center';
    host.style.marginLeft = '5px';
    toolbar.appendChild(host);
    return host;
  }

  removeToolbarButton(): void {
    document.querySelectorAll(this.selectors.toolbarButton).forEach(el => el.remove());
  }
}
