import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PageModification } from 'src/shared/PageModification';
import { settingsPagePageObjectToken } from 'src/page-objects/SettingsPage';
import { WithDi } from 'src/shared/diContext';
import { Token } from 'dioma';
import { SettingsButton } from './components/SettingsButton';
import { SettingsModal } from './components/SettingsModal';
import { registerSwimlaneWipLimitsModule } from '../module';

export class SettingsPageModification extends PageModification<void, Element> {
  private root: Root | null = null;
  private wrapper: HTMLDivElement | null = null;
  private swimlaneSelect: HTMLSelectElement | null = null;

  async shouldApply(): Promise<boolean> {
    return (await this.getSettingsTab()) === 'swimlanes';
  }

  getModificationId(): string {
    return `swimlane-wip-limits-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return Promise.all([
      this.waitForElement('#ghx-swimlane-strategy-config'),
      this.waitForElement('#ghx-swimlanestrategy-select'),
    ]).then(([config]) => config);
  }

  async apply(): Promise<void> {
    registerSwimlaneWipLimitsModule(this.container);

    this.swimlaneSelect = document.querySelector('#ghx-swimlanestrategy-select');

    if (this.swimlaneSelect?.value === 'custom') {
      this.renderButton();
    }

    // Listen for strategy changes
    if (this.swimlaneSelect) {
      this.addEventListener(this.swimlaneSelect, 'change', event => {
        const select = event.target as HTMLSelectElement;
        if (select.value === 'custom') {
          this.renderButton();
        } else {
          this.removeButton();
        }
      });
    }
  }

  private renderButton(): void {
    if (this.wrapper) return; // Already rendered

    const pageObject = this.container.inject(settingsPagePageObjectToken).getSwimlaneLimitsSettingsTabPageObject();
    const configContainer = pageObject.getConfigContainer();

    if (!configContainer) return;

    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('data-jh-swimlane-settings', 'true');
    this.wrapper.style.marginTop = '1rem';
    configContainer.parentNode?.insertBefore(this.wrapper, configContainer);

    this.root = createRoot(this.wrapper);
    this.root.render(
      React.createElement(WithDi, {
        container: this.container,
        children: React.createElement(
          React.Fragment,
          null,
          React.createElement(SettingsButton),
          React.createElement(SettingsModal)
        ),
      })
    );

    this.sideEffects.push(() => {
      this.removeButton();
    });
  }

  private removeButton(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.wrapper) {
      this.wrapper.remove();
      this.wrapper = null;
    }
  }
}

export const swimlaneWipLimitsSettingsPageToken = new Token<SettingsPageModification>('SettingsPageModification');
