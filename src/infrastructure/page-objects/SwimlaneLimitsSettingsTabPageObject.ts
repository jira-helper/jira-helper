import React from 'react';
import { createRoot } from 'react-dom/client';

export class SwimlaneLimitsSettingsTabPageObject {
  static selectors = {
    /** Контейнер со swimlane стратегией */
    swimlaneConfig: '#ghx-swimlane-strategy-config',
    /** Select для выбора стратегии swimlane */
    swimlaneSelect: '#ghx-swimlanestrategy-select',
    /** Атрибут для кнопки настроек */
    settingsButton: '[data-jh-swimlane-settings]',
  };

  /**
   * Проверить, что используется custom swimlane strategy
   */
  isCustomSwimlaneStrategy(): boolean {
    const select = document.querySelector(
      SwimlaneLimitsSettingsTabPageObject.selectors.swimlaneSelect
    ) as HTMLSelectElement | null;
    return select?.value === 'custom';
  }

  /**
   * Получить контейнер для вставки кнопки настроек.
   * Кнопка вставляется перед #ghx-swimlane-strategy-config.
   */
  getConfigContainer(): Element | null {
    return document.querySelector(SwimlaneLimitsSettingsTabPageObject.selectors.swimlaneConfig);
  }

  /**
   * Вставить кнопку настроек.
   * Создаёт контейнер перед swimlane config и рендерит React компонент.
   */
  insertSettingsButton(component: React.ReactNode): void {
    const configContainer = this.getConfigContainer();
    if (!configContainer) return;

    // Проверяем, не вставлена ли уже кнопка
    const existing = document.querySelector(SwimlaneLimitsSettingsTabPageObject.selectors.settingsButton);
    if (existing) return;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-jh-swimlane-settings', 'true');
    wrapper.style.marginTop = '1rem';

    configContainer.parentNode?.insertBefore(wrapper, configContainer);

    const root = createRoot(wrapper);
    root.render(component);
  }

  /**
   * Удалить кнопку настроек.
   */
  removeSettingsButton(): void {
    const button = document.querySelector(SwimlaneLimitsSettingsTabPageObject.selectors.settingsButton);
    button?.remove();
  }
}
