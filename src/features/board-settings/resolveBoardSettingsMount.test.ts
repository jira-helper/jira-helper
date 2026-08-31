import { afterEach, describe, expect, it } from 'vitest';
import {
  PROJECT_HEADER_MOUNT_SELECTOR,
  isBoardSettingsVisibleForUrl,
  resolveBoardSettingsMount,
} from './resolveBoardSettingsMount';

const PRIMARY = '[data-testid="software-board.header.controls-bar"]';

describe('resolveBoardSettingsMount', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('prefers the primary controls-bar when present', () => {
    document.body.innerHTML = `
      <div data-testid="horizontal-nav-header.ui.project-header.header"></div>
      <div data-testid="software-board.header.controls-bar"></div>
    `;

    const mount = resolveBoardSettingsMount(PRIMARY);

    expect(mount?.strategy).toBe('primary');
    expect(mount?.element.getAttribute('data-testid')).toBe('software-board.header.controls-bar');
  });

  it('falls back to project header when primary is missing', () => {
    document.body.innerHTML =
      '<div data-testid="horizontal-nav-header.ui.project-header.header"><span>nav</span></div>';

    const mount = resolveBoardSettingsMount(PRIMARY);

    expect(mount?.strategy).toBe('fallback');
    expect(mount?.element.matches(PROJECT_HEADER_MOUNT_SELECTOR)).toBe(true);
  });

  it('returns null when neither mount point exists', () => {
    document.body.innerHTML = '<div id="root"></div>';

    expect(resolveBoardSettingsMount(PRIMARY)).toBeNull();
  });
});

describe('isBoardSettingsVisibleForUrl', () => {
  it('is visible when url contains board', () => {
    expect(isBoardSettingsVisibleForUrl('https://x.atlassian.net/jira/software/projects/KAN/boards/1')).toBe(true);
  });

  it('is hidden when url has no board segment', () => {
    expect(isBoardSettingsVisibleForUrl('https://x.atlassian.net/jira/software/projects/KAN/issues')).toBe(false);
  });
});
