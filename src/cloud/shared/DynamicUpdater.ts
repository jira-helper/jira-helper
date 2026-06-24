// src/cloud/shared/DynamicUpdater.ts
// Динамический обновлятель с исправленными селекторами для Jira Cloud

export interface UpdateEvent {
  type: 'cards-added' | 'cards-removed' | 'columns-changed' | 'full-refresh';
  timestamp: number;
}

export interface UpdateSubscriber {
  onUpdate(event: UpdateEvent): void;
}

export class DynamicUpdater {
  private observer: MutationObserver | null = null;
  private boardContainer: HTMLElement | null = null;
  private updateTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_TIME = 500;
  private isUpdating = false;

  private subscribers = new Set<UpdateSubscriber>();
  private callbackSubscribers = new Set<() => void>();

  constructor() {}

  subscribe(subscriber: UpdateSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  onUpdate(callback: () => void): () => void {
    this.callbackSubscribers.add(callback);
    return () => this.callbackSubscribers.delete(callback);
  }

  unsubscribe(subscriber: UpdateSubscriber): void {
    this.subscribers.delete(subscriber);
  }

  private notifySubscribers(event: UpdateEvent): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber.onUpdate(event);
      } catch (error) {
        console.error('[DynamicUpdater] Ошибка уведомления подписчика:', error);
      }
    });

    this.callbackSubscribers.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[DynamicUpdater] Ошибка вызова callback:', error);
      }
    });
  }

  start() {
    this.findBoardContainerAndObserve();
    console.log('[DynamicUpdater] Запущен, ожидание контейнера доски...');
  }

  private findBoardContainerAndObserve() {
    // Обновлённые селекторы для Jira Cloud
    const boardSelectors = [
      '[data-testid="software-board.board-container.board"]',
      '[data-testid^="software-board.board-container"]',
      '[data-component-selector*="board"]',
      '.ghx-columns',
      '#ghx-pool',
      '[data-component-selector*="column"]', // самый надёжный - контейнер с колонками
    ];

    const findBoard = () => {
      for (const selector of boardSelectors) {
        const element = document.querySelector(selector);
        if (element) return element as HTMLElement;
      }
      return null;
    };

    this.boardContainer = findBoard();

    if (this.boardContainer) {
      this.setupMutationObserver();
      this.updateAll();
      console.log('[DynamicUpdater] Контейнер доски найден, наблюдаем за изменениями');
    } else {
      setTimeout(() => this.findBoardContainerAndObserve(), 200);
    }
  }

  private setupMutationObserver() {
    if (!this.boardContainer) return;

    this.observer = new MutationObserver(mutations => {
      if (this.isUpdating) return;

      const relevantMutation = mutations.some(m => {
        if (m.type === 'childList') {
          for (const node of Array.from(m.addedNodes)) {
            if (this.isCardElement(node as Element) || this.isCardContainer(node as Element)) {
              return true;
            }
          }
          for (const node of Array.from(m.removedNodes)) {
            if (this.isCardElement(node as Element) || this.isCardContainer(node as Element)) {
              return true;
            }
          }
        }

        if (m.type === 'attributes') {
          const target = m.target as Element;
          if (this.isCardElement(target) || this.isColumnElement(target)) {
            return true;
          }
        }

        return false;
      });

      if (relevantMutation) {
        console.log('[DynamicUpdater] Обнаружены изменения, запускаю обновление');
        this.debouncedUpdate();
      }
    });

    this.observer.observe(this.boardContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-testid', 'data-component-selector'],
    });
  }

  private isCardElement(element: Element | null): boolean {
    if (!element || !element.matches) return false;
    // Добавлены data-component-selector селекторы для Jira Cloud
    return element.matches(
      '[data-testid*="card"], [data-testid*="issue"], [data-component-selector*="card"], [data-component-selector*="issue"], [id*="card-"]'
    );
  }

  private isCardContainer(element: Element | null): boolean {
    if (!element || !element.matches) return false;
    return element.matches(
      '[data-testid*="column"] [data-testid*="list"], [data-component-selector*="column"] [data-component-selector*="list"], [class*="ghx-list"]'
    );
  }

  private isColumnElement(element: Element | null): boolean {
    if (!element || !element.matches) return false;
    // Добавлены data-component-selector селекторы для Jira Cloud
    return element.matches('[data-testid*="column"], [data-component-selector*="column"], .__board-test-hook__column');
  }

  private debouncedUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.updateAll();
    }, this.DEBOUNCE_TIME);
  }

  private updateAll() {
    this.isUpdating = true;

    const event: UpdateEvent = {
      type: 'full-refresh',
      timestamp: Date.now(),
    };

    this.notifySubscribers(event);

    setTimeout(() => {
      this.isUpdating = false;
    }, 100);
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }
    this.isUpdating = false;
    console.log('[DynamicUpdater] Обновление остановлено');
  }
}
