// src/cloud/features/assignee-highlighter/AssigneeHighlighterFeatureSettings.ts
// Настройки подсветки исполнителей - валидация и модель

import type { SettingsService } from '../../shared/SettingsService';

export type VisualizationType = 'stripe' | 'background' | 'border';

export interface AssigneeHighlighterFeatureState {
  enabled: boolean;
  visualizationType: VisualizationType;
  autoColors: boolean;
  customColors: Record<string, string>;
  customBackgroundColors: Record<string, string>;
  highlightUnassigned: boolean;
  unassignedColor: string;
  unassignedBackgroundColor: string;
}

/**
 * Класс для работы с настройками подсветки исполнителей.
 * Инкапсулирует логику валидации и работы с настройками фичи.
 */
export class AssigneeHighlighterFeatureSettings {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Получить текущее состояние настроек фичи
   */
  getState(): AssigneeHighlighterFeatureState {
    const settings = this.settingsService.getSettings();
    const highlight = settings.assigneeHighlight;

    return {
      enabled: highlight?.enabled || false,
      visualizationType: highlight?.visualizationType || 'stripe',
      autoColors: highlight?.autoColors !== false,
      customColors: highlight?.customColors || {},
      customBackgroundColors: highlight?.customBackgroundColors || {},
      highlightUnassigned: highlight?.highlightUnassigned !== false,
      unassignedColor: highlight?.unassignedColor || 'rgba(0, 0, 0, 0.5)',
      unassignedBackgroundColor: highlight?.unassignedBackgroundColor || 'rgba(0, 0, 0, 0.1)',
    };
  }

  /**
   * Проверить, включена ли фича
   */
  isEnabled(): boolean {
    return this.getState().enabled;
  }

  /**
   * Включить/выключить фичу
   */
  setEnabled(enabled: boolean): void {
    const current = this.getState();
    this.settingsService.updateSettings({
      assigneeHighlight: {
        enabled,
        visualizationType: current.visualizationType,
        autoColors: current.autoColors,
        customColors: current.customColors,
        customBackgroundColors: current.customBackgroundColors,
        highlightUnassigned: current.highlightUnassigned,
        unassignedColor: current.unassignedColor,
        unassignedBackgroundColor: current.unassignedBackgroundColor,
      },
    });
  }

  /**
   * Получить тип визуализации
   */
  getVisualizationType(): VisualizationType {
    return this.getState().visualizationType;
  }

  /**
   * Установить тип визуализации
   */
  setVisualizationType(type: VisualizationType): void {
    const current = this.getState();
    this.settingsService.updateSettings({
      assigneeHighlight: {
        ...current,
        visualizationType: type,
      },
    });
  }

  /**
   * Использовать автоматические цвета
   */
  setAutoColors(autoColors: boolean): void {
    const current = this.getState();
    this.settingsService.updateSettings({
      assigneeHighlight: {
        ...current,
        autoColors,
      },
    });
  }

  /**
   * Получить автоматические цвета
   */
  isAutoColors(): boolean {
    return this.getState().autoColors;
  }

  /**
   * Подсвечивать неназначенные задачи
   */
  setHighlightUnassigned(highlight: boolean): void {
    const current = this.getState();
    this.settingsService.updateSettings({
      assigneeHighlight: {
        ...current,
        highlightUnassigned: highlight,
      },
    });
  }

  /**
   * Получить подсветку неназначенных
   */
  isHighlightUnassigned(): boolean {
    return this.getState().highlightUnassigned;
  }

  /**
   * Установить цвет для неназначенных
   */
  setUnassignedColor(color: string): void {
    const current = this.getState();
    this.settingsService.updateSettings({
      assigneeHighlight: {
        ...current,
        unassignedColor: color,
      },
    });
  }

  /**
   * Получить цвет для неназначенных
   */
  getUnassignedColor(): string {
    return this.getState().unassignedColor;
  }

  /**
   * Установить кастомный цвет для исполнителя
   */
  setAssigneeColor(assigneeId: string, color: string): void {
    const current = this.getState();
    const newCustomColors = { ...current.customColors, [assigneeId]: color };

    this.settingsService.updateSettings({
      assigneeHighlight: {
        ...current,
        customColors: newCustomColors,
      },
    });
  }

  /**
   * Получить кастомный цвет для исполнителя
   */
  getAssigneeColor(assigneeId: string): string | undefined {
    return this.getState().customColors[assigneeId];
  }

  /**
   * Удалить кастомный цвет для исполнителя
   */
  removeAssigneeColor(assigneeId: string): void {
    const current = this.getState();
    const newCustomColors = { ...current.customColors };
    delete newCustomColors[assigneeId];

    this.settingsService.updateSettings({
      assigneeHighlight: {
        ...current,
        customColors: newCustomColors,
      },
    });
  }

  /**
   * Установить кастомный фон для исполнителя
   */
  setAssigneeBackgroundColor(assigneeId: string, color: string): void {
    const current = this.getState();
    const newCustomBackgroundColors = { ...current.customBackgroundColors, [assigneeId]: color };

    this.settingsService.updateSettings({
      assigneeHighlight: {
        ...current,
        customBackgroundColors: newCustomBackgroundColors,
      },
    });
  }

  /**
   * Получить все кастомные цвета
   */
  getAllCustomColors(): Record<string, string> {
    return this.getState().customColors;
  }

  /**
   * Валидация настроек
   */
  validate(): { valid: boolean; errors: string[] } {
    const state = this.getState();
    const errors: string[] = [];

    if (state.visualizationType && !['stripe', 'background', 'border'].includes(state.visualizationType)) {
      errors.push('Некорректный тип визуализации');
    }

    if (state.unassignedColor && !this.isValidColor(state.unassignedColor)) {
      errors.push('Некорректный цвет для неназначенных');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Проверка валидности цвета
   */
  private isValidColor(color: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color) || /^rgba?/.test(color);
  }

  /**
   * Сбросить все настройки к значениям по умолчанию
   */
  reset(): void {
    this.settingsService.updateSettings({
      assigneeHighlight: {
        enabled: false,
        visualizationType: 'stripe',
        autoColors: true,
        customColors: {},
        customBackgroundColors: {},
        highlightUnassigned: true,
        unassignedColor: 'rgba(0, 0, 0, 0.5)',
        unassignedBackgroundColor: 'rgba(0, 0, 0, 0.1)',
      },
    });
  }
}
