/* eslint-disable no-console -- Legacy Jira Cloud adapter logs help diagnose live-board integration. */
// src/cloud/features/assignee-highlighter/AssigneeHighlighterApplier.ts
// Applier для подсветки исполнителей на доске Jira Cloud

import type { SettingsService } from '../../shared/SettingsService';
import type { AssigneeService, Assignee } from '../../shared/AssigneeService';

export class AssigneeHighlighterApplier {
  private isEnabled = false;

  private observer: MutationObserver | null = null;

  private _paintTimeout: number | null = null;

  private lastUpdateTime = 0;

  private readonly UPDATE_INTERVAL = 500;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly assigneeService: AssigneeService
  ) {}

  applyAssigneeColors(): void {
    if (!this.isEnabled) return;

    const now = Date.now();
    if (now - this.lastUpdateTime < this.UPDATE_INTERVAL) {
      return;
    }
    this.lastUpdateTime = now;

    const doPaint = () => {
      try {
        const cards = this.getAllCards();

        if (cards.length === 0) {
          if (this._paintTimeout) clearTimeout(this._paintTimeout);
          this._paintTimeout = window.setTimeout(doPaint, 300);
          return;
        }

        cards.forEach(card => {
          this.paintCardByAssignee(card);
        });
      } catch (error) {
        console.error('[AssigneeHighlighterApplier] Ошибка покраски исполнителей:', error);
      }
    };

    setTimeout(doPaint, 100);
  }

  enable(): void {
    if (this.isEnabled) return;

    console.log('[AssigneeHighlighterApplier] Включение подсветки исполнителей');
    this.isEnabled = true;

    this.applyAssigneeColors();
    this.startObservation();

    setTimeout(() => {
      if (this.isEnabled) {
        this.applyAssigneeColors();
      }
    }, 500);
  }

  disable(): void {
    if (!this.isEnabled) return;

    console.log('[AssigneeHighlighterApplier] Отключение подсветки исполнителей');
    this.isEnabled = false;

    if (this._paintTimeout) {
      clearTimeout(this._paintTimeout);
      this._paintTimeout = null;
    }

    this.removeAllVisualizations();
    this.stopObservation();
  }

  private paintCardByAssignee(card: HTMLElement): void {
    if (card.hasAttribute('data-jh-wip-overloaded') || card.classList.contains('jh-wip-overloaded')) {
      return;
    }

    this.removeVisualization(card);

    const assignee = this.assigneeService.getAssigneeForCard(card);
    if (!assignee) return;

    const settings = this.settingsService.getSettings();
    const vizType = settings.assigneeHighlight?.visualizationType || 'stripe';

    switch (vizType) {
      case 'stripe':
        this.applyStripe(card, assignee);
        break;
      case 'background':
        this.applyBackground(card, assignee);
        break;
      case 'border':
        this.applyBorder(card, assignee);
        break;
    }
  }

  updateAllVisualizations(): void {
    if (!this.isEnabled) return;
    this.applyAssigneeColors();
  }

  private applyStripe(card: HTMLElement, assignee: Assignee): void {
    const stripe = document.createElement('div');
    stripe.className = 'jira-helper-assignee-stripe';
    stripe.dataset.assigneeId = assignee.id;

    Object.assign(stripe.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '6px',
      height: '100%',
      backgroundColor: assignee.color,
      zIndex: '100',
      pointerEvents: 'none',
    });

    this.attachToCard(card, stripe);
  }

  private applyBackground(card: HTMLElement, assignee: Assignee): void {
    const innerCard = this.getInnerCard(card);
    const backgroundColor = this.addAlpha(assignee.color, 0.4);
    innerCard.style.backgroundColor = backgroundColor;
    innerCard.dataset.assigneeHighlight = 'true';
  }

  private applyBorder(card: HTMLElement, assignee: Assignee): void {
    const innerCard = this.getInnerCard(card);
    innerCard.style.border = `2px solid ${assignee.color}`;
    innerCard.style.borderRadius = '4px';
    innerCard.dataset.assigneeHighlight = 'true';
  }

  private startObservation(): void {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      if (!this.isEnabled) return;

      if (this._paintTimeout) clearTimeout(this._paintTimeout);
      this._paintTimeout = window.setTimeout(() => {
        this.updateAllVisualizations();
      }, 300);
    });

    const board = document.querySelector('[data-testid="software-board.board"]') || document.body;
    this.observer.observe(board, {
      childList: true,
      subtree: true,
      attributes: false,
    });
  }

  private stopObservation(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private getAllCards(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('[data-testid="platform-board-kit.ui.card.card"]'));
  }

  private getInnerCard(card: HTMLElement): HTMLElement {
    return (
      card.querySelector<HTMLElement>('[data-testid="software-context-menu.ui.context-menu.children-wrapper"] > div') ||
      card
    );
  }

  private attachToCard(card: HTMLElement, element: HTMLElement): void {
    const innerCard = this.getInnerCard(card);

    if (getComputedStyle(innerCard).position === 'static') {
      innerCard.style.position = 'relative';
    }

    innerCard.appendChild(element);
  }

  private addAlpha(color: string, alpha: number): string {
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/g, `${alpha})`);
    }

    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return color;
  }

  private removeVisualization(card: HTMLElement): void {
    if (card.hasAttribute('data-jh-wip-overloaded') || card.classList.contains('jh-wip-overloaded')) {
      return;
    }

    const stripe = card.querySelector('.jira-helper-assignee-stripe');
    if (stripe) stripe.remove();

    const innerCard = this.getInnerCard(card);
    if (!innerCard) return;

    if (!card.style.backgroundColor.includes('rgba(')) {
      innerCard.style.backgroundColor = '';
      innerCard.style.border = '';
      innerCard.style.borderRadius = '';
    }

    delete innerCard.dataset.assigneeHighlight;
  }

  private removeAllVisualizations(): void {
    const cards = this.getAllCards();
    cards.forEach(card => {
      if (!card.hasAttribute('data-jh-wip-overloaded') && !card.classList.contains('jh-wip-overloaded')) {
        this.removeVisualization(card);
      }
    });
  }

  isEnabledStatus(): boolean {
    return this.isEnabled;
  }

  updateVisualization(): void {
    if (!this.isEnabled) return;
    this.applyAssigneeColors();
  }
}
