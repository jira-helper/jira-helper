import React from 'react';
import { createRoot, Root } from 'react-dom/client';

export interface IFieldLimitsBoardPageObject {
  selectors: {
    extraField: string;
    subnavTitle: string;
  };

  getFieldNameFromExtraField(extraField: Element): string | null;
  getExtraFieldTexts(extraField: Element): string[];
  colorCard(issue: Element, color: string): void;
  resetCardColor(issue: Element): void;
  insertSubnavComponent(component: React.ReactNode, key: string): void;
  removeSubnavComponent(key: string): void;
}

export class FieldLimitsBoardPageObject implements IFieldLimitsBoardPageObject {
  readonly selectors = {
    extraField: '.ghx-extra-field',
    subnavTitle: '#subnav-title',
  };

  private subnavRoots: Map<string, { root: Root; wrapper: HTMLDivElement }> = new Map();

  /**
   * Извлекает имя поля из атрибута data-tooltip или title.
   * Формат: "FieldName: value" → "FieldName"
   */
  getFieldNameFromExtraField(extraField: Element): string | null {
    const tooltipAttr = extraField.getAttribute('data-tooltip') || extraField.getAttribute('title');
    if (!tooltipAttr) return null;
    return tooltipAttr.split(':')[0]?.trim() || null;
  }

  /**
   * Извлекает текстовые значения из childNodes extra-field элемента.
   * Каждый child node → innerText → результат в массиве.
   */
  getExtraFieldTexts(extraField: Element): string[] {
    const texts: string[] = [];
    if (extraField.childNodes instanceof NodeList) {
      extraField.childNodes.forEach(node => {
        const text = ((node as HTMLElement).innerText ?? node.textContent ?? '').trim();
        if (text) {
          texts.push(text);
        }
      });
    }
    return texts;
  }

  /**
   * Устанавливает цвет фона карточки.
   */
  colorCard(issue: Element, color: string): void {
    (issue as HTMLElement).style.backgroundColor = color;
  }

  /**
   * Сбрасывает цвет фона карточки.
   */
  resetCardColor(issue: Element): void {
    (issue as HTMLElement).style.backgroundColor = '';
  }

  /**
   * Вставляет React-компонент в subnav.
   */
  insertSubnavComponent(component: React.ReactNode, key: string): void {
    this.removeSubnavComponent(key);

    const subnavTitle = document.querySelector(this.selectors.subnavTitle);
    if (!subnavTitle) return;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-jh-field-limits', key);
    wrapper.style.display = 'inline-block';
    wrapper.style.marginLeft = '8px';
    subnavTitle.appendChild(wrapper);

    const root = createRoot(wrapper);
    root.render(component);
    this.subnavRoots.set(key, { root, wrapper });
  }

  /**
   * Удаляет React-компонент из subnav.
   */
  removeSubnavComponent(key: string): void {
    const entry = this.subnavRoots.get(key);
    if (entry) {
      entry.root.unmount();
      entry.wrapper.remove();
      this.subnavRoots.delete(key);
    }
  }
}
