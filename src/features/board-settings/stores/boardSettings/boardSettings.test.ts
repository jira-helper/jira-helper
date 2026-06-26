import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBoardSettingsStore } from './boardSettings';
import type { BoardSetting } from './types';

const TestComponent = () => null;

const createSetting = (id: string, title = id): BoardSetting => ({
  id,
  title,
  component: TestComponent,
});

const getRegisteredIds = () => useBoardSettingsStore.getState().data.settings.map(setting => setting.id);
const getRegisteredTitles = () => useBoardSettingsStore.getState().data.settings.map(setting => setting.title);

describe('boardSettings store', () => {
  beforeEach(() => {
    useBoardSettingsStore.setState({ data: { settings: [] } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('orders known settings tabs by user workflow instead of registration order', () => {
    const { addSetting } = useBoardSettingsStore.getState().actions;

    addSetting(createSetting('diagnostic', 'Diagnostic'));
    addSetting(createSetting('person-wip-limits', 'Person WIP Limits'));
    addSetting(createSetting('additional-card-elements', 'Additional Card Elements'));
    addSetting(createSetting('local-settings', 'Local Settings'));
    addSetting(createSetting('column-wip-limits', 'Column WIP Limits'));
    addSetting(createSetting('sub-tasks-progress', 'Sub-tasks progress'));
    addSetting(createSetting('comment-templates', 'Comment templates'));

    expect(getRegisteredIds()).toEqual([
      'column-wip-limits',
      'person-wip-limits',
      'sub-tasks-progress',
      'additional-card-elements',
      'comment-templates',
      'local-settings',
      'diagnostic',
    ]);
  });

  it('keeps unknown settings before the always-last tabs in registration order', () => {
    const { addSetting } = useBoardSettingsStore.getState().actions;

    addSetting(createSetting('custom-integration'));
    addSetting(createSetting('local-settings', 'Local Settings'));
    addSetting(createSetting('another-extension'));
    addSetting(createSetting('diagnostic', 'Diagnostic'));

    expect(getRegisteredIds()).toEqual(['custom-integration', 'another-extension', 'local-settings', 'diagnostic']);
  });

  it('uses stable ids instead of localized title text', () => {
    const { addSetting } = useBoardSettingsStore.getState().actions;

    addSetting(createSetting('diagnostic', 'Диагностика'));
    addSetting(createSetting('column-wip-limits', 'Лимиты по колонкам'));
    addSetting(createSetting('local-settings', 'Локальные настройки'));

    expect(getRegisteredTitles()).toEqual(['Лимиты по колонкам', 'Локальные настройки', 'Диагностика']);
  });

  it('ignores duplicate settings by stable id', () => {
    const { addSetting } = useBoardSettingsStore.getState().actions;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    addSetting(createSetting('local-settings', 'Local Settings'));
    addSetting(createSetting('local-settings', 'Локальные настройки'));

    expect(getRegisteredTitles()).toEqual(['Local Settings']);
    expect(warn).toHaveBeenCalledWith('Setting with id "local-settings" already exists');
  });
});
