import React from 'react';

import { useGetTextsByLocale } from 'src/shared/texts';
import { Select } from 'antd';
import { useLocalSettingsStore } from '../stores/localSettingsStore';
import { Locale } from '../types/local-settings';
import { updateLocalSettings } from '../actions/updateLocalSettings';
import styles from './LocalSettingsTab.module.css';

const TEXTS = {
  languageOption: {
    ru: 'Язык',
    en: 'Language',
  },
  languageAutoOption: {
    ru: 'Авто',
    en: 'Auto',
  },
  languageRussianOption: {
    ru: 'Русский',
    en: 'Russian',
  },
  languageEnglishOption: {
    ru: 'Английский',
    en: 'English',
  },
} as const;

export const LocalSettingsTab = () => {
  const { settings } = useLocalSettingsStore();

  const handleLocaleChange = async (value: Locale) => {
    updateLocalSettings({ locale: value });
  };

  const texts = useGetTextsByLocale(TEXTS);

  return (
    <div className={styles.localSettings}>
      <div className={styles.settingGroup}>
        <label htmlFor="locale-select">
          <span className={styles.settingLabel}>{texts.languageOption}</span>
          <Select
            id="locale-select"
            value={settings.locale}
            onChange={value => handleLocaleChange(value)}
            data-testid="locale-select"
            className={styles.settingSelect}
          >
            <Select.Option value="auto">{texts.languageAutoOption}</Select.Option>
            <Select.Option value="ru">{texts.languageRussianOption}</Select.Option>
            <Select.Option value="en">{texts.languageEnglishOption}</Select.Option>
          </Select>
        </label>
      </div>
    </div>
  );
};
