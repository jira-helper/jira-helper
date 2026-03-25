import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PageModification } from 'src/shared/PageModification';
import { settingsPagePageObjectToken } from 'src/page-objects/SettingsPage';
import { WithDi } from 'src/shared/diContext';
import { globalContainer } from 'dioma';
import { routingServiceToken } from 'src/routing';
import { SettingsButton } from './components/SettingsButton';
import { SettingsModal } from './components/SettingsModal';
import { registerSwimlaneWipLimitsModule } from '../module';

export class SettingsPageModification extends PageModification<void, Element> {
  private root: Root | null = null;
  private wrapper: HTMLDivElement | null = null;
  private swimlaneSelect: HTMLSelectElement | null = null;

  async shouldApply(): Promise<boolean> {
    return (await globalContainer.inject(routingServiceToken).getSettingsTab()) === 'swimlanes';
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
    registerSwimlaneWipLimitsModule(globalContainer);

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

    const pageObject = globalContainer.inject(settingsPagePageObjectToken).getSwimlaneLimitsSettingsTabPageObject();
    const configContainer = pageObject.getConfigContainer();

    if (!configContainer) return;

    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('data-jh-swimlane-settings', 'true');
    this.wrapper.style.marginTop = '1rem';
    configContainer.parentNode?.insertBefore(this.wrapper, configContainer);

    this.root = createRoot(this.wrapper);
    this.root.render(
      React.createElement(WithDi, {
        container: globalContainer,
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
