/* eslint-disable @typescript-eslint/no-unused-vars, no-empty -- Legacy Jira Cloud avatar cleanup intentionally ignores best-effort DOM failures. */
// src/cloud/shared/AvatarIndicatorService.ts
// Сервис для отображения индикаторов на аватарах пользователей

import type { AssigneeService } from './AssigneeService';

/**
 * Конфигурация индикатора на аватаре
 */
export interface AvatarIndicator {
  /** ID пользователя */
  userId: string;
  /** Тип индикатора */
  type: 'wip-overload' | 'group-wip-overload' | 'column-limit' | 'custom';
  /** Цвет индикатора */
  color: string;
  /** Текст подсказки */
  tooltip?: string;
  /** Иконка (эмодзи) */
  icon?: string;
  /** Позиция индикатора */
  position?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Сервис для отображения индикаторов на аватарах пользователей.
 * Управляет визуальными индикаторами перегрузки WIP-лимитов.
 */
export class AvatarIndicatorService {
  private indicators = new Map<string, AvatarIndicator[]>();

  constructor(private readonly assigneeService: AssigneeService) {}

  /**
   * Добавляет индикатор для пользователя
   * @param userId - ID пользователя
   * @param indicator - Конфигурация индикатора
   */
  addIndicator(userId: string, indicator: AvatarIndicator) {
    const userIndicators = this.indicators.get(userId) || [];
    const filtered = userIndicators.filter(i => i.type !== indicator.type);
    filtered.push(indicator);
    this.indicators.set(userId, filtered);
    this.refreshUserAvatar(userId);
  }

  /**
   * Удаляет индикатор указанного типа для пользователя
   * @param userId - ID пользователя
   * @param type - Тип индикатора
   */
  removeIndicator(userId: string, type: string) {
    const userIndicators = this.indicators.get(userId);
    if (userIndicators) {
      const filtered = userIndicators.filter(i => i.type !== type);
      this.indicators.set(userId, filtered);
      this.refreshUserAvatar(userId);
    }
  }

  /**
   * Удаляет все индикаторы указанного типа для всех пользователей
   * @param type - Тип индикатора
   */
  removeIndicatorsByType(type: string) {
    const affectedUsers: string[] = [];
    this.indicators.forEach((indicators, userId) => {
      const filtered = indicators.filter(i => i.type !== type);
      if (filtered.length !== indicators.length) {
        this.indicators.set(userId, filtered);
        affectedUsers.push(userId);
      }
    });
    affectedUsers.forEach(userId => this.refreshUserAvatar(userId));
  }

  private refreshUserAvatar(userId: string) {
    const indicators = this.indicators.get(userId) || [];

    let indicatorToShow: AvatarIndicator | null = null;

    const personalWip = indicators.find(i => i.type === 'wip-overload');
    if (personalWip) {
      indicatorToShow = personalWip;
    } else {
      const groupWip = indicators.find(i => i.type === 'group-wip-overload');
      if (groupWip) {
        indicatorToShow = groupWip;
      }
    }

    this.clearUserAvatars(userId);

    if (indicatorToShow) {
      this.applyIndicatorToUserAvatars(userId, indicatorToShow);
    }
  }

  private clearUserAvatars(userId: string) {
    const avatars = this.findUserAvatars(userId);
    avatars.forEach(avatar => {
      const containers = avatar.querySelectorAll('.jh-avatar-indicator-container');
      containers.forEach(container => container.remove());
    });
  }

  private applyIndicatorToUserAvatars(userId: string, indicator: AvatarIndicator) {
    const avatars = this.findUserAvatars(userId);
    avatars.forEach(avatar => {
      this.applyIndicatorToAvatar(avatar, indicator);
    });
  }

  private findUserAvatars(userId: string): HTMLElement[] {
    const avatars: HTMLElement[] = [];

    let userName = '';
    try {
      const allUsers = this.assigneeService.getAllAssigneesFromCards();
      const user = allUsers.find(u => u.id === userId);
      if (user) {
        userName = user.name || user.displayName;
      }
    } catch (error) {}

    if (!userName) return avatars;

    const allAvatars = document.querySelectorAll('[data-testid*="ak-avatar"], [data-testid*="avatar"]');
    allAvatars.forEach(avatar => {
      const label = avatar.querySelector('[data-testid*="ak-avatar--label"]');
      if (label && label.textContent === userName) {
        avatars.push(avatar as HTMLElement);
        return;
      }

      const img = avatar.querySelector('img');
      if (img && img.alt && img.alt.includes(userName)) {
        if (!avatars.includes(avatar as HTMLElement)) {
          avatars.push(avatar as HTMLElement);
        }
        return;
      }

      if (avatar.textContent && avatar.textContent.includes(userName)) {
        if (!avatars.includes(avatar as HTMLElement)) {
          avatars.push(avatar as HTMLElement);
        }
      }
    });

    return avatars;
  }

  private findAvatarContainer(avatar: HTMLElement): HTMLElement | null {
    const container =
      avatar.closest('[data-testid*="filters.ui.filters.assignee.stateless.avatar"]') ||
      avatar.closest('._2rko1rr0') ||
      avatar.closest('[data-testid*="ak-avatar"]') ||
      avatar;

    if (container && getComputedStyle(container).position === 'static') {
      (container as HTMLElement).style.position = 'relative';
    }

    return container as HTMLElement;
  }

  private applyIndicatorToAvatar(avatar: HTMLElement, indicator: AvatarIndicator) {
    const container = this.findAvatarContainer(avatar);
    if (!container) return;

    const oldIndicator = container.querySelector('.jh-avatar-indicator-container');
    if (oldIndicator) oldIndicator.remove();

    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'jh-avatar-indicator-container';

    const top = '-4px';
    const right = indicator.position === 'left' ? 'auto' : '-4px';
    const left = indicator.position === 'left' ? '-4px' : 'auto';

    indicatorContainer.style.cssText = `
      position: absolute !important;
      top: ${top} !important;
      ${left !== 'auto' ? `left: ${left} !important;` : ''}
      ${right !== 'auto' ? `right: ${right} !important;` : ''}
      z-index: 999999 !important;
      pointer-events: none !important;
    `;

    const icon = document.createElement('div');
    icon.className = `jh-avatar-indicator jh-avatar-indicator-${indicator.type}`;
    icon.title = indicator.tooltip || '';
    icon.innerHTML = '🚨';
    icon.style.cssText = `
      width: 18px !important;
      height: 18px !important;
      border-radius: 50% !important;
      background-color: ${indicator.color} !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 6px !important;
      color: white !important;
      font-weight: bold !important;
      box-shadow: 0 0 0 1px white, 0 0 0 2px ${indicator.color} !important;
      border: 1px solid rgba(255, 255, 255, 0.5) !important;
      text-shadow: 0 10px 2px rgba(255, 0, 0, 0.5) !important;
    `;

    indicatorContainer.appendChild(icon);
    container.appendChild(indicatorContainer);
  }

  /**
   * Обновляет все индикаторы на аватарах
   */
  updateAll() {
    this.indicators.forEach((_, userId) => {
      this.refreshUserAvatar(userId);
    });
  }

  /**
   * Проверяет, есть ли индикатор указанного типа у пользователя
   * @param userId - ID пользователя
   * @param type - Тип индикатора
   * @returns true, если индикатор есть
   */
  hasIndicator(userId: string, type: string): boolean {
    const indicators = this.indicators.get(userId);
    return indicators ? indicators.some(i => i.type === type) : false;
  }
}
