export const PROJECT_HEADER_MOUNT_SELECTOR = '[data-testid="horizontal-nav-header.ui.project-header.header"]';

export type BoardSettingsMountStrategy = 'primary' | 'fallback';

export type BoardSettingsMount = {
  element: Element;
  strategy: BoardSettingsMountStrategy;
};

export function isBoardSettingsVisibleForUrl(url: string): boolean {
  return url.toLowerCase().includes('board');
}

export function resolveBoardSettingsMount(primarySelector: string): BoardSettingsMount | null {
  const primary = document.querySelector(primarySelector);
  if (primary) {
    return { element: primary, strategy: 'primary' };
  }

  const fallback = document.querySelector(PROJECT_HEADER_MOUNT_SELECTOR);
  if (fallback) {
    return { element: fallback, strategy: 'fallback' };
  }

  return null;
}
