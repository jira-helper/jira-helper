/**
 * Container компонент для настроек цветов карточек.
 * Использует SettingsUIModel для управления состоянием.
 *
 * @module CardColorsSettingsContainer
 */

import React, { useEffect } from 'react';
import { CardColorsSettingsComponent } from './CardColorsSettingsComponent';
import type { ModelEntry } from 'src/infrastructure/di/Module';
import type { SettingsUIModel } from '../models/SettingsUIModel';

/**
 * Props для CardColorsSettingsContainer.
 */
interface CardColorsSettingsContainerProps {
  /**
   * Entry для SettingsUIModel.
   */
  settingsUIModel: ModelEntry<SettingsUIModel>;

  /**
   * Принудительно открыть tooltip.
   */
  forceTooltipOpen?: boolean;
}

/**
 * Container компонент для настроек цветов карточек.
 * Использует SettingsUIModel для управления состоянием.
 */
export const CardColorsSettingsContainer: React.FC<CardColorsSettingsContainerProps> = ({
  settingsUIModel: settingsUIModelEntry,
  forceTooltipOpen,
}) => {
  const { model: settingsActions, useModel: useSettingsSnapshot } = settingsUIModelEntry;
  const settingsState = useSettingsSnapshot();

  /**
   * Загрузить настройки при монтировании компонента.
   */
  useEffect(() => {
    const loadSettings = async () => {
      const result = await settingsActions.open();

      if (result.err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load card colors settings:', result.val.message);
      }
    };

    loadSettings();

    // При размонтировании сбрасываем состояние модели
    return () => {
      settingsActions.reset();
    };
  }, [settingsActions]);

  /**
   * Обработчик изменения состояния checkbox.
   */
  const handleCheckboxChange = async (newValue: boolean) => {
    settingsActions.setEnabled(newValue);

    // Сохраняем изменения
    const result = await settingsActions.save();

    if (result.err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save card colors settings:', result.val.message);
    }
  };

  return (
    <CardColorsSettingsComponent
      cardColorsEnabled={settingsState.draft.enabled}
      onCardColorsEnabledChange={handleCheckboxChange}
      forceTooltipOpen={forceTooltipOpen}
      isLoading={settingsState.isLoading}
      isSaving={settingsState.isSaving}
      error={settingsState.error}
    />
  );
};
