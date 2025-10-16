import Checkbox from 'antd/es/checkbox';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, Tooltip } from 'antd';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { useDi } from 'src/shared/diContext';
import { useGetTextsByLocale } from 'src/shared/texts';
import { WarningFilled } from '@ant-design/icons';

export const TEXTS = {
  selectColumnsWhereFeatureShouldBeTracked: {
    en: 'Select columns where feature should be tracked:',
    ru: 'Выберите колонки, где должна работать фича:',
  },
  warningTooltip: {
    ru: 'Включите фичу только для тех колонок, где вам реально важно видеть эту информацию. Включение для всех колонок может привести к значительному увеличению нагрузки на Jira и замедлить скорость работы плагина',
    en: 'Enable the feature only for those columns where you really need to see this information. Enabling for all columns may lead to significant load on Jira and slow down the plugin',
  },
  noColumnsAvailable: {
    en: 'No columns available',
    ru: 'Нет доступных колонок',
  },
  columnsSettingsTitle: {
    en: 'Select columns for tracking',
    ru: 'Выбор колонок для отслеживания',
  },
  refreshColumns: {
    en: 'Refresh columns',
    ru: 'Обновить колонки',
  },
} as const;

// Component for the columns list
const ColumnsList = ({
  columns,
  onUpdate,
  disabled,
  testIdPrefix = 'column-selector',
}: {
  columns: { name: string; enabled: boolean }[];
  onUpdate: (updatedColumns: { name: string; enabled: boolean }[]) => void;
  disabled?: boolean;
  testIdPrefix?: string;
}) => {
  const texts = useGetTextsByLocale(TEXTS);
  if (columns.length === 0) {
    return <div data-testid={`${testIdPrefix}-no-columns`}>{texts.noColumnsAvailable}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
      {columns.map(column => (
        <div key={column.name} data-testid={`${testIdPrefix}-column`}>
          <Checkbox
            data-testid={`${testIdPrefix}-column-checkbox`}
            checked={column.enabled}
            disabled={disabled}
            onChange={() => {
              const updatedColumns = columns.map(c => {
                if (c.name === column.name) {
                  return { ...c, enabled: !c.enabled };
                }
                return c;
              });
              onUpdate(updatedColumns);
            }}
          >
            <span data-testid={`${testIdPrefix}-column-name`}>{column.name}</span>
          </Checkbox>
        </div>
      ))}
    </div>
  );
};

export interface ColumnSelectorProps {
  /** Current columns state */
  columns: { name: string; enabled: boolean }[];
  /** Callback when columns are updated */
  onUpdate: (columns: { name: string; enabled: boolean }[]) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Custom title for the card */
  title?: string;
  /** Custom description text */
  description?: string;
  /** Test ID prefix for testing */
  testIdPrefix?: string;
  /** Whether to show warning tooltip */
  showWarning?: boolean;
}

export const ColumnSelectorPure = ({
  columns,
  onUpdate,
  disabled,
  title,
  description,
  testIdPrefix = 'column-selector',
  showWarning = true,
}: ColumnSelectorProps) => {
  const texts = useGetTextsByLocale(TEXTS);

  return (
    <Card title={title || texts.columnsSettingsTitle} style={{ marginBottom: '16px' }} type="inner">
      <p style={{ marginBottom: '16px' }}>
        {description || texts.selectColumnsWhereFeatureShouldBeTracked}{' '}
        {showWarning && (
          <Tooltip overlayStyle={{ maxWidth: 600 }} title={<p>{texts.warningTooltip}</p>}>
            <span>
              <WarningFilled style={{ color: 'orange' }} size={24} />
            </span>
          </Tooltip>
        )}
      </p>
      <ColumnsList columns={columns} onUpdate={onUpdate} disabled={disabled} testIdPrefix={testIdPrefix} />
    </Card>
  );
};

export interface ColumnSelectorContainerProps {
  /** Current columns to track */
  columnsToTrack: string[];
  /** Callback when columns are updated */
  onUpdate: (columns: { name: string; enabled: boolean }[]) => void;
  /** Loading state */
  loading?: boolean;
  /** Custom title for the card */
  title?: string;
  /** Custom description text */
  description?: string;
  /** Test ID prefix for testing */
  testIdPrefix?: string;
  /** Whether to show warning tooltip */
  showWarning?: boolean;
}

export const ColumnSelectorContainer = ({
  columnsToTrack,
  onUpdate,
  loading = false,
  title,
  description,
  testIdPrefix = 'column-selector',
  showWarning = true,
}: ColumnSelectorContainerProps) => {
  const boardPagePageObject = useDi().inject(boardPagePageObjectToken) as typeof BoardPagePageObject;
  const [columnsFromBoard, setColumnsFromBoard] = useState<string[]>(boardPagePageObject.getColumns());

  const columns = useMemo(() => {
    const columnsToState = columnsFromBoard.map(column => ({
      name: column,
      enabled: columnsToTrack.includes(column),
    }));
    return columnsToState;
  }, [columnsToTrack, columnsFromBoard]);

  /**
   * Component can be rendered before board is loaded
   * In that case we get zero columns from board
   * If we have zero columns, we try to get columns periodically
   */
  useEffect(() => {
    if (columnsFromBoard.length === 0) {
      const interval = setInterval(() => {
        setColumnsFromBoard(boardPagePageObject.getColumns());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [columnsFromBoard.length, boardPagePageObject]);

  const isLoading = loading || columnsFromBoard.length === 0;

  return (
    <ColumnSelectorPure
      columns={columns}
      onUpdate={onUpdate}
      disabled={isLoading}
      title={title}
      description={description}
      testIdPrefix={testIdPrefix}
      showWarning={showWarning}
    />
  );
};
