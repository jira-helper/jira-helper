import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PageModification } from 'src/shared/PageModification';
import { WithDi } from 'src/shared/diContext';
import { globalContainer } from 'dioma';
import { getSettingsTab } from 'src/routing';
import { useDi } from 'src/shared/diContext';
import { useGetTextsByLocale } from 'src/shared/texts';
import { SettingsButton } from './components/SettingsButton';
import { SettingsModal } from './components/SettingsModal';
import { registerFieldLimitsModule } from '../module';
import { settingsUIModelToken } from '../tokens';
import { FIELD_LIMITS_TEXTS } from '../texts';
import type { SettingsUIModel } from './models/SettingsUIModel';

const ConnectedSettingsButton: React.FC = () => {
  const container = useDi();
  const { model } = container.inject(settingsUIModelToken);
  const texts = useGetTextsByLocale(FIELD_LIMITS_TEXTS);
  const handleClick = async () => {
    await (model as SettingsUIModel).open();
  };
  return React.createElement(SettingsButton, { onClick: handleClick, label: texts.settingsButton });
};

export class SettingsPageModification extends PageModification<void, Element> {
  private root: Root | null = null;
  private wrapper: HTMLDivElement | null = null;

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'cardLayout';
  }

  getModificationId(): string {
    return `field-limits-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('#ghx-config-cardLayout');
  }

  async apply(): Promise<void> {
    registerFieldLimitsModule(globalContainer);

    const container = document.querySelector('#ghx-config-cardLayout');
    if (!container) return;

    const description = container.querySelector('p');

    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('data-jh-field-limits-settings', 'true');
    this.wrapper.style.marginTop = '1rem';

    if (description?.nextSibling) {
      container.insertBefore(this.wrapper, description.nextSibling);
    } else {
      container.appendChild(this.wrapper);
    }

    this.root = createRoot(this.wrapper);
    this.root.render(
      React.createElement(WithDi, {
        container: globalContainer,
        children: React.createElement(
          React.Fragment,
          null,
          React.createElement(ConnectedSettingsButton),
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
