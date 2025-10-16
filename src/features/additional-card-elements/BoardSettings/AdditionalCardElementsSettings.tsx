import React from 'react';
import { Button, Checkbox, Divider } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useGetSettings } from '../hooks/useGetSettings';
import { ColumnSettings } from './ColumnSettings';
import { IssueLinksSettings } from './IssueLinksSettings';

const TEXTS = {
  title: {
    en: 'Additional Card Elements',
    ru: 'Дополнительные элементы карточек',
  },
  resetButton: {
    en: 'Reset all settings',
    ru: 'Сброс всех настроек',
  },
  enableFeature: {
    en: 'Enable additional card elements',
    ru: 'Включить дополнительные элементы карточек',
  },
  columnSettingsTitle: {
    en: 'Column Settings',
    ru: 'Настройки колонок',
  },
  issueLinksTitle: {
    en: 'Issue Links',
    ru: 'Связи задач',
  },
};

export const AdditionalCardElementsSettings: React.FC = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { settings } = useGetSettings();

  const handleReset = () => {
    // TODO: Implement reset functionality
    console.log('Reset settings');
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '16px' }}>{texts.title}</h2>

      <Checkbox checked={settings.enabled} onChange={() => {}} style={{ marginBottom: '16px' }}>
        {texts.enableFeature}
      </Checkbox>

      <Button type="primary" onClick={handleReset} disabled={!settings.enabled} style={{ marginBottom: '16px' }}>
        {texts.resetButton}
      </Button>

      <Divider />

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>{texts.columnSettingsTitle}</h3>
        <ColumnSettings />
      </div>

      <Divider />

      <div>
        <h3 style={{ marginBottom: '16px' }}>{texts.issueLinksTitle}</h3>
        <IssueLinksSettings />
      </div>
    </div>
  );
};
