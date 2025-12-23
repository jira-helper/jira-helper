import React from 'react';
import { Button, Checkbox, Divider, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { ColumnSelectorContainer } from 'src/shared/components';
import { IssueLinkSettings } from './IssueLinkSettings';
import { DaysInColumnSettings } from './DaysInColumnSettings';
import { DaysToDeadlineSettings } from './DaysToDeadlineSettings';
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
    en: 'Display issue links on cards',
    ru: 'Отображение связей задач на карточках',
  },
  showInBacklog: {
    en: 'Show links in backlog',
    ru: 'Показывать связи в беклоге',
  },
  showInBacklogTooltip: {
    en: 'If enabled, issue links will be displayed on cards in the backlog view',
    ru: 'Если включено, связи задач будут отображаться на карточках в беклоге',
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
      showInBacklog: false,
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
              extraContent={
                <Checkbox
                  checked={data.showInBacklog}
                  onChange={() => actions.setShowInBacklog(!data.showInBacklog)}
                  data-testid="show-in-backlog-checkbox"
                >
                  {texts.showInBacklog}
                  <Tooltip title={texts.showInBacklogTooltip}>
                    <InfoCircleOutlined style={{ marginLeft: '4px', color: '#1677ff' }} />
                  </Tooltip>
                </Checkbox>
              }
            />
          </div>

          <Divider />

          {/* Issue Link Settings */}
          <div>
            <IssueLinkSettings />
          </div>

          <Divider />

          {/* Days in Column Settings */}
          <div>
            <DaysInColumnSettings />
          </div>

          <Divider />

          {/* Days to Deadline Settings */}
          <div>
            <DaysToDeadlineSettings />
          </div>
        </>
      )}
    </div>
  );
};
