import React from 'react';
import { createRoot, Root } from 'react-dom/client';

export interface IColumnsSettingsTabPageObject {
  /**
   * Зарегистрировать компонент кнопки.
   * PageObject следит за DOM и ре-рендерит при необходимости.
   * @returns cleanup function (вызвать при destroy фичи)
   */
  registerButton(id: string, component: React.ReactNode): () => void;

  /** Принудительно очистить всё (при смене страницы) */
  destroy(): void;
}

/**
 * PageObject для tab "Columns" на странице настроек доски.
 *
 * Управляет рендерингом кнопок от нескольких фич (column-limits, person-limits, wip-on-cells).
 * Автоматически следит за DOM и ре-рендерит кнопки, если Jira пересоздаёт контейнер
 * (например, при изменении настройки "count subtasks").
 */
export class ColumnsSettingsTabPageObject implements IColumnsSettingsTabPageObject {
  static selectors = {
    columnsConfig: '#ghx-config-columns',
    buttonsContainer: '[data-jh-columns-buttons]',
  };

  private buttons = new Map<string, React.ReactNode>();
  private root: Root | null = null;
  private observer: MutationObserver | null = null;

  registerButton(id: string, component: React.ReactNode): () => void {
    this.buttons.set(id, component);
    this.ensureWatching();
    this.render();

    return () => {
      this.buttons.delete(id);
      if (this.buttons.size > 0) {
        this.render();
      } else {
        this.destroy();
      }
    };
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;

    this.root?.unmount();
    this.root = null;

    this.buttons.clear();

    const container = document.querySelector(ColumnsSettingsTabPageObject.selectors.buttonsContainer);
    container?.remove();
  }

  private ensureWatching(): void {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      const containerExists = document.querySelector(ColumnsSettingsTabPageObject.selectors.buttonsContainer);
      const configExists = document.querySelector(ColumnsSettingsTabPageObject.selectors.columnsConfig);

      // #ghx-config-columns exists but our container doesn't — need to re-render
      if (configExists && !containerExists && this.buttons.size > 0) {
        this.root = null;
        this.render();
      }
    });

    // Watch document.body because #ghx-config-columns may be fully recreated by Jira
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  private render(): void {
    if (this.buttons.size === 0) return;

    let container = document.querySelector(ColumnsSettingsTabPageObject.selectors.buttonsContainer);
    if (!container) {
      container = this.createButtonsContainer();
      if (!container) return;
    }

    if (!this.root) {
      this.root = createRoot(container);
    }

    const buttonElements = Array.from(this.buttons.entries()).map(([id, component]) =>
      React.createElement('div', { key: id, 'data-button-id': id }, component)
    );

    this.root.render(React.createElement(React.Fragment, null, ...buttonElements));
  }

  private createButtonsContainer(): Element | null {
    const columnsConfig = document.querySelector(ColumnsSettingsTabPageObject.selectors.columnsConfig);
    if (!columnsConfig) return null;

    const { children } = columnsConfig;
    const lastChild = children.length > 0 ? children[children.length - 1] : null;
    if (!lastChild) return null;

    const container = document.createElement('div');
    container.setAttribute('data-jh-columns-buttons', 'true');
    container.style.display = 'flex';
    container.style.gap = '8px';
    container.style.marginBottom = '10px';

    lastChild.insertAdjacentElement('beforebegin', container);
    return container;
  }
}
