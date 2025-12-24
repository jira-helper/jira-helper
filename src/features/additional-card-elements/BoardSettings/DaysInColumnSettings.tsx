import React, { useState, useEffect } from 'react';
import { Checkbox, InputNumber, Alert, Space, Typography, Button } from 'antd';
import { DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useDi } from 'src/shared/diContext';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';
import { ColumnThresholds } from '../types';

const { Text } = Typography;

const TEXTS = {
  title: {
    en: 'Days in Column Badge',
    ru: 'Бейдж "Дней в колонке"',
  },
  enable: {
    en: 'Show days in column badge',
    ru: 'Показывать бейдж с днями в колонке',
  },
  warningThreshold: {
    en: 'Warning (yellow) after days:',
    ru: 'Предупреждение (жёлтый) после дней:',
  },
  dangerThreshold: {
    en: 'Danger (red) after days:',
    ru: 'Опасность (красный) после дней:',
  },
  thresholdHint: {
    en: 'Leave empty for no highlighting',
    ru: 'Оставьте пустым, чтобы не подсвечивать',
  },
  invalidThresholds: {
    en: 'Warning: "Danger" threshold is less than or equal to "Warning" threshold. The badge might not work as expected.',
    ru: 'Внимание: порог "Опасность" меньше или равен порогу "Предупреждение". Бейдж может работать не так, как ожидается.',
  },
  usePerColumnThresholds: {
    en: 'Use separate rules for each column',
    ru: 'Использовать отдельные правила для каждой колонки',
  },
  columnNotOnBoard: {
    en: 'This column no longer exists on the board',
    ru: 'Эта колонка больше не существует на доске',
  },
  removeColumn: {
    en: 'Remove',
    ru: 'Удалить',
  },
  warning: {
    en: 'Warning',
    ru: 'Предупр.',
  },
  danger: {
    en: 'Danger',
    ru: 'Опасность',
  },
  jiraSettingsRequired: {
    en: 'Important: This feature works ONLY if "Show days in column" is enabled in your board settings. Please check your board configuration → Card layout → Show days in column.',
    ru: 'Важно: Эта функция работает ТОЛЬКО если в настройках доски включено "Показывать дни в колонке". Проверьте настройки доски → Макет карточки → Показывать дни в колонке.',
  },
} as const;

interface ColumnThresholdRowProps {
  columnName: string;
  thresholds: ColumnThresholds;
  existsOnBoard: boolean;
  onWarningChange: (value: number | null) => void;
  onDangerChange: (value: number | null) => void;
  onRemove: () => void;
  texts: ReturnType<typeof useGetTextsByLocale<keyof typeof TEXTS>>;
}

const ColumnThresholdRow: React.FC<ColumnThresholdRowProps> = ({
  columnName,
  thresholds,
  existsOnBoard,
  onWarningChange,
  onDangerChange,
  onRemove,
  texts,
}) => {
  const hasInvalidThresholds =
    thresholds.warningThreshold !== undefined &&
    thresholds.dangerThreshold !== undefined &&
    thresholds.dangerThreshold <= thresholds.warningThreshold;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        backgroundColor: existsOnBoard ? '#fafafa' : '#fff7e6',
        borderRadius: '4px',
        border: existsOnBoard ? '1px solid #d9d9d9' : '1px solid #faad14',
      }}
      data-testid={`column-threshold-row-${columnName}`}
    >
      <div style={{ minWidth: '120px', fontWeight: 500 }}>
        {columnName}
        {!existsOnBoard && <WarningOutlined style={{ color: '#faad14', marginLeft: '8px' }} />}
      </div>

      {existsOnBoard ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {texts.warning}:
            </Text>
            <InputNumber
              min={1}
              value={thresholds.warningThreshold}
              onChange={onWarningChange}
              placeholder=""
              size="small"
              style={{ width: '60px' }}
              data-testid={`column-threshold-warning-${columnName}`}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {texts.danger}:
            </Text>
            <InputNumber
              min={1}
              value={thresholds.dangerThreshold}
              onChange={onDangerChange}
              placeholder=""
              size="small"
              style={{ width: '60px' }}
              data-testid={`column-threshold-danger-${columnName}`}
            />
          </div>

          {hasInvalidThresholds && <WarningOutlined style={{ color: '#faad14' }} title={texts.invalidThresholds} />}
        </>
      ) : (
        <>
          <Text type="secondary" style={{ flex: 1, fontSize: '12px' }}>
            {texts.columnNotOnBoard}
          </Text>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
            size="small"
            data-testid={`column-threshold-remove-${columnName}`}
          >
            {texts.removeColumn}
          </Button>
        </>
      )}
    </div>
  );
};

export const DaysInColumnSettings: React.FC = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const boardPagePageObject = useDi().inject(boardPagePageObjectToken) as typeof BoardPagePageObject;
  const { data, actions } = useAdditionalCardElementsBoardPropertyStore();
  const { daysInColumn, columnsToTrack } = data;

  const [boardColumns, setBoardColumns] = useState<string[]>([]);

  // Get columns from board (with retry for late loading)
  useEffect(() => {
    const getColumns = () => {
      const columns = boardPagePageObject.getColumns();
      if (columns.length > 0) {
        setBoardColumns(columns);
      }
    };

    getColumns();

    // Retry periodically if no columns found
    if (boardColumns.length === 0) {
      const interval = setInterval(getColumns, 1000);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [boardPagePageObject, boardColumns.length]);

  const handleEnabledChange = (checked: boolean) => {
    actions.setDaysInColumn({ enabled: checked });
  };

  const handleWarningThresholdChange = (value: number | null) => {
    actions.setDaysInColumn({ warningThreshold: value ?? undefined });
  };

  const handleDangerThresholdChange = (value: number | null) => {
    actions.setDaysInColumn({ dangerThreshold: value ?? undefined });
  };

  const handleUsePerColumnThresholdsChange = (checked: boolean) => {
    actions.setDaysInColumn({ usePerColumnThresholds: checked });
  };

  const handleColumnWarningChange = (columnName: string, value: number | null) => {
    const perColumnThresholds = { ...(daysInColumn.perColumnThresholds || {}) };
    perColumnThresholds[columnName] = {
      ...perColumnThresholds[columnName],
      warningThreshold: value ?? undefined,
    };
    actions.setDaysInColumn({ perColumnThresholds });
  };

  const handleColumnDangerChange = (columnName: string, value: number | null) => {
    const perColumnThresholds = { ...(daysInColumn.perColumnThresholds || {}) };
    perColumnThresholds[columnName] = {
      ...perColumnThresholds[columnName],
      dangerThreshold: value ?? undefined,
    };
    actions.setDaysInColumn({ perColumnThresholds });
  };

  const handleRemoveColumn = (columnName: string) => {
    const perColumnThresholds = { ...(daysInColumn.perColumnThresholds || {}) };
    delete perColumnThresholds[columnName];
    actions.setDaysInColumn({ perColumnThresholds });
  };

  const hasInvalidGlobalThresholds =
    daysInColumn.warningThreshold !== undefined &&
    daysInColumn.dangerThreshold !== undefined &&
    daysInColumn.dangerThreshold <= daysInColumn.warningThreshold;

  // Get columns that should show thresholds:
  // 1. Columns from columnsToTrack that exist on board
  // 2. Columns from perColumnThresholds that don't exist on board (for warning/removal)
  const columnsForThresholds = React.useMemo(() => {
    const perColumnThresholds = daysInColumn.perColumnThresholds || {};
    const result: { name: string; existsOnBoard: boolean }[] = [];

    // Add tracked columns that exist on board
    columnsToTrack.forEach(col => {
      if (boardColumns.includes(col)) {
        result.push({ name: col, existsOnBoard: true });
      }
    });

    // Add columns from perColumnThresholds that don't exist on board
    Object.keys(perColumnThresholds).forEach(col => {
      if (!boardColumns.includes(col) && !result.some(r => r.name === col)) {
        result.push({ name: col, existsOnBoard: false });
      }
    });

    return result;
  }, [columnsToTrack, boardColumns, daysInColumn.perColumnThresholds]);

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '12px' }}>{texts.title}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '16px', marginBottom: '12px' }}>
        <Checkbox
          checked={daysInColumn.enabled}
          onChange={e => handleEnabledChange(e.target.checked)}
          data-testid="days-in-column-enabled-checkbox"
        >
          {texts.enable}
        </Checkbox>

        {daysInColumn.enabled && (
          <Checkbox
            checked={daysInColumn.usePerColumnThresholds}
            onChange={e => handleUsePerColumnThresholdsChange(e.target.checked)}
            data-testid="days-in-column-use-per-column-checkbox"
          >
            {texts.usePerColumnThresholds}
          </Checkbox>
        )}
      </div>

      {daysInColumn.enabled && (
        <div style={{ marginLeft: '24px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              type="info"
              message={texts.jiraSettingsRequired}
              showIcon
              data-testid="days-in-column-jira-settings-required"
              style={{ marginBottom: '8px' }}
            />
            {!daysInColumn.usePerColumnThresholds ? (
              // Global thresholds
              <>
                <div>
                  <Text>{texts.warningThreshold}</Text>
                  <InputNumber
                    min={1}
                    value={daysInColumn.warningThreshold}
                    onChange={handleWarningThresholdChange}
                    placeholder=""
                    data-testid="days-in-column-warning-threshold"
                    style={{ marginLeft: '8px', width: '80px' }}
                  />
                  <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                    {texts.thresholdHint}
                  </Text>
                </div>

                <div>
                  <Text>{texts.dangerThreshold}</Text>
                  <InputNumber
                    min={1}
                    value={daysInColumn.dangerThreshold}
                    onChange={handleDangerThresholdChange}
                    placeholder=""
                    data-testid="days-in-column-danger-threshold"
                    style={{ marginLeft: '8px', width: '80px' }}
                  />
                  <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                    {texts.thresholdHint}
                  </Text>
                </div>

                {hasInvalidGlobalThresholds && (
                  <Alert
                    type="warning"
                    message={texts.invalidThresholds}
                    showIcon
                    data-testid="days-in-column-invalid-thresholds-warning"
                  />
                )}
              </>
            ) : (
              // Per-column thresholds
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {columnsForThresholds.length === 0 ? (
                  <Text type="secondary">
                    {boardColumns.length === 0 ? 'Loading columns...' : 'No columns selected for tracking'}
                  </Text>
                ) : (
                  columnsForThresholds.map(({ name, existsOnBoard }) => (
                    <ColumnThresholdRow
                      key={name}
                      columnName={name}
                      thresholds={daysInColumn.perColumnThresholds?.[name] || {}}
                      existsOnBoard={existsOnBoard}
                      onWarningChange={value => handleColumnWarningChange(name, value)}
                      onDangerChange={value => handleColumnDangerChange(name, value)}
                      onRemove={() => handleRemoveColumn(name)}
                      texts={texts}
                    />
                  ))
                )}
              </div>
            )}
          </Space>
        </div>
      )}
    </div>
  );
};
