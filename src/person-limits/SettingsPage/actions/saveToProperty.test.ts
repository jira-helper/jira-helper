import { describe, it, expect, beforeEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken } from 'src/shared/di/jiraApiTokens';
import { saveToProperty } from './saveToProperty';
import { usePersonWipLimitsPropertyStore } from '../../property/store';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import type { PersonLimit } from '../../property/types';

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

    usePersonWipLimitsPropertyStore.getState().actions.reset();
    useSettingsUIStore.setState(useSettingsUIStore.getInitialState());
  });

  it('should copy UI store limits to property store', async () => {
    const limit: PersonLimit = {
      id: 1,
      person: {
        name: 'u',
        displayName: 'U',
        self: '',
        avatar: '',
      },
      limit: 5,
      columns: [],
      swimlanes: [],
    };

    useSettingsUIStore.getState().actions.setLimits([limit]);

    await saveToProperty();

    const propState = usePersonWipLimitsPropertyStore.getState();
    expect(propState.data.limits).toHaveLength(1);
    expect(propState.data.limits[0].limit).toBe(5);
  });
});
