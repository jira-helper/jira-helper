import React from 'react';
import { Button, Checkbox, Divider } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import { ColumnSelectorContainer } from 'src/shared/components';
import { IssueLinkSettings } from './IssueLinkSettings';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';

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
  columnsTitle: {
    en: 'Column Settings',
    ru: 'Настройки колонок',
  },
  columnsDescription: {
    en: 'Select columns where additional card elements should be displayed',
    ru: 'Выберите колонки, где должны отображаться дополнительные элементы карточек',
  },
  issueLinksTitle: {
    en: 'Issue Link Settings',
    ru: 'Настройки связей задач',
  },
} as const;

export const AdditionalCardElementsSettings: React.FC = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { data, actions } = useAdditionalCardElementsBoardPropertyStore();

  const handleToggleEnabled = () => {
    actions.setEnabled(!data.enabled);
  };

  const handleResetSettings = () => {
    actions.setData({
      enabled: false,
      columnsToTrack: [],
      issueLinks: [],
    });
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '16px' }}>{texts.title}</h2>

      <Checkbox
        checked={data.enabled}
        data-testid="additional-card-elements-enabled-checkbox"
        onChange={handleToggleEnabled}
        style={{ marginBottom: '16px' }}
      >
        {texts.enableFeature}
      </Checkbox>

      <Button
        type="primary"
        onClick={handleResetSettings}
        disabled={!data.enabled}
        data-testid="reset-board-property-button"
        style={{ marginBottom: '16px' }}
      >
        {texts.resetButton}
      </Button>

      {data.enabled && (
        <>
          <Divider />

          {/* Column Settings */}
          <div style={{ marginBottom: '24px' }}>
            <ColumnSelectorContainer
              columnsToTrack={data.columnsToTrack || []}
              onUpdate={actions.setColumns}
              loading={false}
              title={texts.columnsTitle}
              description={texts.columnsDescription}
              testIdPrefix="additional-card-elements"
              showWarning
            />
          </div>

          <Divider />

          {/* Issue Link Settings */}
          <div>
            <IssueLinkSettings />
          </div>
        </>
      )}
    </div>
  );
};
