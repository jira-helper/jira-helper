/* eslint-disable no-console, @typescript-eslint/no-unused-vars -- Legacy Jira Cloud service keeps diagnostic branches for live-board API fallbacks. */
// src/cloud/shared/AssigneeService.ts
// Сервис для работы с исполнителями на доске Jira Cloud

import type { SettingsService } from './SettingsService';

/**
 * Информация об исполнителе задачи
 */
export interface Assignee {
  /** Уникальный идентификатор исполнителя */
  id: string;
  /** Полное имя исполнителя */
  name: string;
  /** Короткое отображаемое имя (инициалы) */
  displayName: string;
  /** Цвет для подсветки */
  color: string;
  /** URL аватара */
  avatarUrl?: string;
}

let counter = 0;

/**
 * Сервис для работы с исполнителями на доске Jira Cloud.
 * Извлекает информацию об исполнителях из карточек и назначает цвета.
 */
export class AssigneeService {
  private readonly colorPalette = [
    '#FF0000', // Красный
    '#FF7F00', // Оранжевый
    '#FFFF00', // Жёлтый
    '#00FF00', // Зелёный
    '#0000FF', // Синий
    '#4B0082', // Индиго
    '#8B00FF', // Фиолетовый
    '#000000', // Чёрный
  ];

  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Возвращает список всех исполнителей на доске
   * @returns Массив объектов Assignee с назначенными цветами
   */
  getAllAssigneesFromCards(): Assignee[] {
    const cards = this.getAllCards();
    const assigneesMap = new Map<string, Omit<Assignee, 'color'>>();

    cards.forEach(card => {
      const assigneeData = this.getAssigneeFromCard(card);
      if (assigneeData && !assigneesMap.has(assigneeData.id)) {
        assigneesMap.set(assigneeData.id, assigneeData);
      }
    });

    const assignees = Array.from(assigneesMap.values()).map(data => ({
      ...data,
      color: '',
    }));

    this.assignColorsToAssignees(assignees);

    return assignees;
  }

  private cache = new Map();

  /**
   * Возвращает исполнителя для указанной карточки
   * @param card - HTML-элемент карточки
   * @returns Объект Assignee или null, если исполнитель не найден
   */
  getAssigneeForCard(card: HTMLElement): Assignee | null {
    const assigneeData = this.getAssigneeFromCard(card);
    if (!assigneeData) return null;

    const allAssignees = this.getAllAssigneesFromCards();
    return allAssignees.find(a => a.id === assigneeData.id) || null;
  }

  // ПРОСТОЙ парсинг карточки
  private getAssigneeFromCard(card: HTMLElement): Omit<Assignee, 'color'> | null {
    try {
      // СПОСОБ 1: Ищем скрытый текст с именем исполнителя
      const hiddenElements = card.querySelectorAll('[hidden], [aria-hidden="true"]');

      for (const element of Array.from(hiddenElements)) {
        const text = element.textContent?.trim();
        if (!text) continue;

        if (text.startsWith('Исполнитель:')) {
          const name = text.replace('Исполнитель:', '').trim();
          if (!name) return null;

          const id = this.generateAssigneeId(element, name);
          const avatarUrl = this.getAvatarUrlForCard(card);

          return {
            id,
            name,
            displayName: this.getDisplayName(name),
            avatarUrl,
          };
        }

        if (text === 'Не назначено') {
          return {
            id: 'unassigned',
            name: 'Не назначено',
            displayName: 'Н/Н',
            avatarUrl: undefined,
          };
        }
      }

      // СПОСОБ 2: Ищем по data-testid
      const assigneeContainers = card.querySelectorAll('[data-testid*="assignee"], [data-testid*="avatar"]');

      for (const container of Array.from(assigneeContainers)) {
        const hiddenText = container.querySelector('[hidden], [aria-hidden="true"]');
        const text = hiddenText?.textContent?.trim();

        if (text?.startsWith('Исполнитель:')) {
          const name = text.replace('Исполнитель:', '').trim();
          const avatarUrl = this.getAvatarUrlForCard(card);

          return {
            id: `container:${this.hashString(name)}`,
            name,
            displayName: this.getDisplayName(name),
            avatarUrl,
          };
        }

        if (text === 'Не назначено') {
          return {
            id: 'unassigned',
            name: 'Не назначено',
            displayName: 'Н/Н',
            avatarUrl: undefined,
          };
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Поиск аватарки
  private getAvatarUrlForCard(card: HTMLElement): string | undefined {
    const log = (...args: any[]) => (counter++ < 10 ? console.log(...args) : () => {});
    try {
      const avatarImg = card.querySelector<HTMLImageElement>(
        '[data-testid="software-board.common.fields.assignee-field-static.avatar-wrapper"] img'
      );

      if (!avatarImg) {
        const gravatarImgs = card.querySelectorAll<HTMLImageElement>('img[src*="gravatar.com"]');
        for (const img of Array.from(gravatarImgs)) {
          if (img?.src) {
            return img.src;
          }
        }

        const anyAvatars = card.querySelectorAll<HTMLImageElement>('img[src*="avatar"]');
        for (const img of Array.from(anyAvatars)) {
          if (img?.src) {
            return img.src;
          }
        }
      }

      return avatarImg?.src;
    } catch (error) {
      return undefined;
    }
  }

  // Генерация ID на основе аватара или имени
  private generateAssigneeId(element: Element, name: string): string {
    const avatarImg = element.closest('div')?.querySelector<HTMLImageElement>('img');

    if (avatarImg?.src) {
      const jiraMatch = avatarImg.src.match(/\/(\d+:[a-f0-9-]{36})\//);
      if (jiraMatch) return jiraMatch[1];

      const gravatarMatch = avatarImg.src.match(/avatar\/([a-f0-9]+)/);
      if (gravatarMatch) return `gravatar:${gravatarMatch[1]}`;
    }

    return `name:${this.hashString(name)}`;
  }

  // Назначение цветов исполнителям
  private assignColorsToAssignees(assignees: Assignee[]): void {
    const settings = this.settingsService.getSettings();

    assignees.forEach((assignee, index) => {
      if (settings.assigneeHighlight?.customColors?.[assignee.id]) {
        assignee.color = settings.assigneeHighlight.customColors[assignee.id];
      } else if (assignee.id === 'unassigned') {
        assignee.color = 'rgba(0, 0, 0, 0.5)';
      } else {
        assignee.color = this.colorPalette[index % this.colorPalette.length];
      }
    });
  }

  // Утилиты
  private getAllCards(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('[data-testid="platform-board-kit.ui.card.card"]'));
  }

  private getDisplayName(fullName: string): string {
    return fullName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}
