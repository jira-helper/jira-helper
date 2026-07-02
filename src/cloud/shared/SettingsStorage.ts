/* eslint-disable no-console -- Legacy Jira Cloud storage adapter logs board-property diagnostics. */
// src/cloud/shared/SettingsStorage.ts
// Сервис для хранения настроек в Jira Board Properties (исправлен парсинг пустого ответа)

import type { IBoardPagePageObject } from './BoardPagePageObject.js';

export class SettingsStorage {
  private boardId: number | null = null;

  constructor(private readonly boardPage: IBoardPagePageObject) {
    this.boardId = boardPage.getBoardId();
    console.log('[SettingsStorage] Инициализирован для board ID:', this.boardId);
  }

  /**
   * Выполняет запрос к Jira Board Properties API
   */
  private async request<T>(method: string, key: string, body?: unknown): Promise<T | null> {
    if (!this.boardId) {
      console.error('[SettingsStorage] No board ID');
      return null;
    }

    const url = `/rest/agile/1.0/board/${this.boardId}/properties/${key}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    };

    if (body) {
      options.body = JSON.stringify({ value: body });
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        console.error(`[SettingsStorage] ${method} failed:`, response.status, response.statusText);
        return null;
      }

      // DELETE возвращает 204 No Content
      if (method === 'DELETE') {
        return null;
      }

      // PUT также может вернуть пустой ответ
      const text = await response.text();
      if (!text) {
        // Пустой ответ - считаем успехом
        return null;
      }

      const data = JSON.parse(text);
      return data.value as T;
    } catch (error) {
      console.error(`[SettingsStorage] ${method} error:`, error);
      return null;
    }
  }

  /**
   * Получает значение по ключу
   */
  async get<T>(key: string): Promise<T | null> {
    return this.request<T>('GET', key);
  }

  /**
   * Устанавливает значение по ключу
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    const result = await this.request<T>('PUT', key, value);
    return result !== null || true; // PUT может вернуть null - это нормально
  }

  /**
   * Удаляет значение по ключу
   */
  async delete(key: string): Promise<boolean> {
    const result = await this.request('DELETE', key);
    return result === null;
  }

  /**
   * Проверяет, доступен ли API
   */
  async isAvailable(): Promise<boolean> {
    if (!this.boardId) {
      return false;
    }
    try {
      const url = `/rest/agile/1.0/board/${this.boardId}`;
      const response = await fetch(url, { method: 'GET', credentials: 'same-origin' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Получает ID доски
   */
  getBoardId(): number | null {
    return this.boardId;
  }
}

// Ключи для хранения настроек
export const SETTINGS_KEYS = {
  PERSON_LIMITS: 'jira-helper-person-limits-v1',
  COLUMN_LIMITS: 'jira-helper-column-limits-v1',
  ASSIGNEE_HIGHLIGHTER: 'jira-helper-assignee-highlighter-v1',
  COLUMN_COLORS: 'jira-helper-column-colors-v1',
} as const;
