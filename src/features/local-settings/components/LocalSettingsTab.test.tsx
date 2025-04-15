import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';

import { registerLogger } from 'src/shared/Logger';
import { step } from 'src/shared/testTools/step';
import { useLocalSettingsStore } from '../stores/localSettingsStore';
import { LocalSettingsTab } from './LocalSettingsTab';
import { loadLocalSettings, STORAGE_KEY } from '../actions/loadLocalSettings';
import { updateLocalSettings } from '../actions/updateLocalSettings';

describe('GlobalSettingsTab', () => {
  beforeEach(() => {
    localStorage.clear();
    globalContainer.reset();

    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerLogger(globalContainer);
  });

  it('should render default settings', async () => {
    step('Given: no settings are stored', () => {
      localStorage.setItem(STORAGE_KEY, 'null');
      // Initial state is already set to default
      loadLocalSettings();
    });

    step('When: component is rendered', () => {
      render(
        <WithDi container={globalContainer}>
          <LocalSettingsTab />
        </WithDi>
      );
    });

    step('Then: should show default locale', () => {
      const localeSelect = screen.getByTestId('locale-select');
      expect(localeSelect.textContent).toBe('Auto');
    });
  });

  it('should render user settings', async () => {
    step('Given: user has settings stored', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ locale: 'en' }));
      loadLocalSettings();
    });

    step('When: component is rendered', () => {
      render(
        <WithDi container={globalContainer}>
          <LocalSettingsTab />
        </WithDi>
      );
    });

    step('Then: should show user locale', async () => {
      await waitFor(() => {
        const localeSelect = screen.getByTestId('locale-select');
        expect(localeSelect.textContent).toBe('English');
      });
    });
  });

  it('should use default settings when loading failed', async () => {
    step('Given: loading settings fails', () => {
      localStorage.setItem(STORAGE_KEY, '{key: not valid json}');
      loadLocalSettings();
    });

    step('When: component is rendered', () => {
      render(
        <WithDi container={globalContainer}>
          <LocalSettingsTab />
        </WithDi>
      );
    });

    step('Then: should show default locale', async () => {
      await waitFor(() => {
        const localeSelect = screen.getByTestId('locale-select');

        expect(localeSelect.textContent).toBe('auto');
      });
    });
  });

  it('should update settings when locale is changed', async () => {
    step('Given: user has settings stored', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ locale: 'en' }));
      loadLocalSettings();
    });

    step('When: component is rendered', () => {
      render(
        <WithDi container={globalContainer}>
          <LocalSettingsTab />
        </WithDi>
      );
    });

    step('When: locale is changed', () => {
      // its hard to fire event from antd select
      // so instead calling action
      updateLocalSettings({ locale: 'ru' });
    });

    step('Then: settings are updated', () => {
      expect(useLocalSettingsStore.getState().settings.locale).toBe('ru');
    });
    step('Then: settings are saved to localStorage', () => {
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ locale: 'ru' }));
    });
  });
});
