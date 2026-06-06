// src/cloud/shared/SettingsService.ts
// Сервис настроек для Jira Cloud (добавлен onSettingsChanged callback)

import type { IBoardPagePageObject } from './BoardPagePageObject.tsx';
import { SettingsStorage, SETTINGS_KEYS } from './SettingsStorage';

export interface AssigneeHighlightSettings {
  enabled: boolean;
  visualizationType: 'stripe' | 'background' | 'border';
  autoColors: boolean;
  customColors: Record<string, string>;
  customBackgroundColors: Record<string, string>;
  highlightUnassigned: boolean;
  unassignedColor: string;
  unassignedBackgroundColor: string;
}

export interface ColumnColorsSettings {
  enabled: boolean;
}

export interface WipLimitSettings {
  enabled: boolean;
  limits: Array<{
    id: string;
    userId: string;
    userName: string;
    columnIds: string[];
    columnNames: string[];
    limit: number;
    color: string;
    baseColor?: string;
    warningColor?: string;
  }>;
}

export interface ColumnGroupWipLimitSettings {
  enabled: boolean;
  limits: Array<{
    id: string;
    name: string;
    columnIds: string[];
    columnNames: string[];
    limit: number;
    baseColor: string;
    warningColor?: string;
  }>;
}

export interface Settings {
  columnColors: ColumnColorsSettings;
  assigneeHighlight: AssigneeHighlightSettings;
  assigneeOverload: {
    enabled: boolean;
    threshold: number;
    borderColor: string;
    borderWidth: string;
  };
  personalWipLimits: WipLimitSettings;
  columnGroupWipLimits: ColumnGroupWipLimitSettings;
}

export class SettingsService {
  private settings: Settings;
  private readonly jiraStorage: SettingsStorage | null;
  private useJiraApi = false;
  private initPromise: Promise<void> | null = null;
  private isInitialized = false;
  
  // Callback для уведомления об изменениях настроек
  private onSettingsChangedCallbacks: Array<() => void> = [];

  constructor(boardPage: IBoardPagePageObject) {
    this.settings = this.getDefaultSettings();
    this.jiraStorage = new SettingsStorage(boardPage);
    
    this.initPromise = this.init();
    this.initPromise.then(() => {
      this.isInitialized = true;
    });
  }

  async waitForInit(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  // Подписаться на изменения настроек
  onSettingsChanged(callback: () => void): () => void {
    this.onSettingsChangedCallbacks.push(callback);
    return () => {
      const index = this.onSettingsChangedCallbacks.indexOf(callback);
      if (index > -1) {
        this.onSettingsChangedCallbacks.splice(index, 1);
      }
    };
  }

  // Уведомить всех подписчиков об изменении настроек
  private notifySettingsChanged(): void {
    this.onSettingsChangedCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[SettingsService] Ошибка в callback onSettingsChanged:', error);
      }
    });
  }

  private async init(): Promise<void> {
    this.useJiraApi = (await this.jiraStorage?.isAvailable()) ?? false;

    if (this.useJiraApi) {
      console.log('[SettingsService] Используем Jira Board Properties API');
      await this.loadFromJira();
    } else {
      console.log('[SettingsService] Jira API недоступен, используем localStorage');
      this.settings = this.loadFromLocalStorage();
    }
  }

  getSettings(): Settings {
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<Settings>): Promise<void> {
    this.settings = {
      ...this.settings,
      ...updates,
      assigneeHighlight: {
        ...this.settings.assigneeHighlight,
        ...updates.assigneeHighlight,
      },
      personalWipLimits: {
        ...this.settings.personalWipLimits,
        ...updates.personalWipLimits,
      },
      columnGroupWipLimits: {
        ...this.settings.columnGroupWipLimits,
        ...updates.columnGroupWipLimits,
      },
    };

    await this.saveSettings();
    this.notifySettingsChanged();
  }

  async setColumnColorsEnabled(enabled: boolean): Promise<void> {
    this.settings.columnColors.enabled = enabled;
    await this.saveSettings();
    this.notifySettingsChanged();
  }

  async setAssigneeColor(assigneeId: string, color: string): Promise<void> {
    if (!this.settings.assigneeHighlight) {
      this.settings.assigneeHighlight = this.getDefaultSettings().assigneeHighlight;
    }
    this.settings.assigneeHighlight.customColors[assigneeId] = color;
    await this.saveSettings();
    this.notifySettingsChanged();
  }

  async setWipLimitColor(limitId: string, color: string): Promise<void> {
    if (this.settings.personalWipLimits?.limits) {
      const index = this.settings.personalWipLimits.limits.findIndex(l => l.id === limitId);
      if (index !== -1) {
        this.settings.personalWipLimits.limits[index].color = color;
        await this.saveSettings();
        this.notifySettingsChanged();
      }
    }
  }

  async saveSettings(): Promise<void> {
    this.saveToLocalStorage();

    if (this.useJiraApi && this.jiraStorage) {
      try {
        await this.jiraStorage.set(SETTINGS_KEYS.PERSON_LIMITS, {
          enabled: this.settings.personalWipLimits.enabled,
          limits: this.settings.personalWipLimits.limits,
        });

        await this.jiraStorage.set(SETTINGS_KEYS.COLUMN_LIMITS, {
          enabled: this.settings.columnGroupWipLimits.enabled,
          limits: this.settings.columnGroupWipLimits.limits,
        });

        await this.jiraStorage.set(SETTINGS_KEYS.ASSIGNEE_HIGHLIGHTER, {
          enabled: this.settings.assigneeHighlight.enabled,
          visualizationType: this.settings.assigneeHighlight.visualizationType,
          autoColors: this.settings.assigneeHighlight.autoColors,
          customColors: this.settings.assigneeHighlight.customColors,
          customBackgroundColors: this.settings.assigneeHighlight.customBackgroundColors,
          highlightUnassigned: this.settings.assigneeHighlight.highlightUnassigned,
          unassignedColor: this.settings.assigneeHighlight.unassignedColor,
          unassignedBackgroundColor: this.settings.assigneeHighlight.unassignedBackgroundColor,
        });

        console.log('[SettingsService] Настройки сохранены в Jira Board Properties');
      } catch (error) {
        console.error('[SettingsService] Ошибка сохранения в Jira API:', error);
      }
    }
  }

  private async loadFromJira(): Promise<void> {
    if (!this.jiraStorage) return;

    try {
      const personLimits = await this.jiraStorage.get<{value: WipLimitSettings}>(SETTINGS_KEYS.PERSON_LIMITS);
      if (personLimits?.value) {
        this.settings.personalWipLimits = personLimits.value;
      }

      const columnLimits = await this.jiraStorage.get<{value: ColumnGroupWipLimitSettings}>(SETTINGS_KEYS.COLUMN_LIMITS);
      if (columnLimits?.value) {
        this.settings.columnGroupWipLimits = columnLimits.value;
      }

      const assigneeHighlight = await this.jiraStorage.get<{value: AssigneeHighlightSettings}>(SETTINGS_KEYS.ASSIGNEE_HIGHLIGHTER);
      if (assigneeHighlight?.value) {
        this.settings.assigneeHighlight = assigneeHighlight.value;
      }

      console.log('[SettingsService] Настройки загружены из Jira Board Properties');
    } catch (error) {
      console.error('[SettingsService] Ошибка загрузки из Jira API:', error);
      this.settings = this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): Settings {
    try {
      const saved = localStorage.getItem('jira-helper-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          columnColors: parsed.columnColors || { enabled: false },
          assigneeHighlight: {
            enabled: parsed.assigneeHighlight?.enabled || false,
            visualizationType: parsed.assigneeHighlight?.visualizationType || 'stripe',
            autoColors: parsed.assigneeHighlight?.autoColors !== false,
            customColors: parsed.assigneeHighlight?.customColors || {},
            customBackgroundColors: parsed.assigneeHighlight?.customBackgroundColors || {},
            highlightUnassigned: parsed.assigneeHighlight?.highlightUnassigned !== false,
            unassignedColor: parsed.assigneeHighlight?.unassignedColor || 'rgba(0, 0, 0, 0.5)',
            unassignedBackgroundColor: parsed.assigneeHighlight?.unassignedBackgroundColor || 'rgba(0, 0, 0, 0.1)',
          },
          assigneeOverload: parsed.assigneeOverload || {
            enabled: true,
            threshold: 2,
            borderColor: '#000000',
            borderWidth: '3px',
          },
          personalWipLimits: parsed.personalWipLimits || { enabled: false, limits: [] },
          columnGroupWipLimits: parsed.columnGroupWipLimits || { enabled: false, limits: [] },
        };
      }
    } catch (error) {
      console.error('[SettingsService] Ошибка загрузки из localStorage:', error);
    }
    return this.getDefaultSettings();
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('jira-helper-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('[SettingsService] Ошибка сохранения в localStorage:', error);
    }
  }

  private getDefaultSettings(): Settings {
    return {
      columnColors: { enabled: false },
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
      assigneeOverload: {
        enabled: true,
        threshold: 2,
        borderColor: '#000000',
        borderWidth: '3px',
      },
      personalWipLimits: { enabled: false, limits: [] },
      columnGroupWipLimits: { enabled: false, limits: [] },
    };
  }
}
