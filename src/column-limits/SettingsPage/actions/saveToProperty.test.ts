import { describe, it, expect, beforeEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken } from 'src/shared/di/jiraApiTokens';
import { saveToProperty } from './saveToProperty';
import { useColumnLimitsPropertyStore } from '../../property/store';
import { useColumnLimitsSettingsUIStore } from '../stores/settingsUIStore';

describe('saveToProperty', () => {
  beforeEach(() => {
    // Setup DI container
    globalContainer.reset();
    registerLogger(globalContainer);
    globalContainer.register({
      token: getBoardIdFromURLToken,
      value: () => '123',
    });
    globalContainer.register({
      token: updateBoardPropertyToken,
      value: vi.fn(),
    });

    useColumnLimitsPropertyStore.getState().actions.reset();
    useColumnLimitsSettingsUIStore.setState(useColumnLimitsSettingsUIStore.getInitialState());
  });

  it('should build WipLimitsProperty from UI store and write to property store', async () => {
    useColumnLimitsSettingsUIStore.getState().actions.setData({
      withoutGroupColumns: [],
      groups: [
        {
          id: 'g1',
          columns: [
            { id: 'col1', name: 'To Do' },
            { id: 'col2', name: 'In Progress' },
          ],
          max: 5,
          customHexColor: '#ff0000',
        },
      ],
    });

    await saveToProperty(['col1', 'col2', 'col3']);

    const propState = useColumnLimitsPropertyStore.getState();
    expect(propState.data.g1).toBeDefined();
    expect(propState.data.g1?.columns).toEqual(['col1', 'col2']);
    expect(propState.data.g1?.max).toBe(5);
    expect(propState.data.g1?.customHexColor).toBe('#ff0000');
  });

  it('should filter out columns not in existingColumnIds', async () => {
    useColumnLimitsSettingsUIStore.getState().actions.setData({
      withoutGroupColumns: [],
      groups: [
        {
          id: 'g1',
          columns: [
            { id: 'col1', name: 'To Do' },
            { id: 'col2', name: 'Removed' },
          ],
          max: 3,
        },
      ],
    });

    await saveToProperty(['col1']);

    const propState = useColumnLimitsPropertyStore.getState();
    expect(propState.data.g1?.columns).toEqual(['col1']);
  });

  it('should not include group when all columns filtered out', async () => {
    useColumnLimitsSettingsUIStore.getState().actions.setData({
      withoutGroupColumns: [],
      groups: [
        {
          id: 'g1',
          columns: [{ id: 'col1', name: 'To Do' }],
          max: 3,
        },
      ],
    });

    await saveToProperty(['col2', 'col3']);

    const propState = useColumnLimitsPropertyStore.getState();
    expect(propState.data.g1).toBeUndefined();
  });
});
