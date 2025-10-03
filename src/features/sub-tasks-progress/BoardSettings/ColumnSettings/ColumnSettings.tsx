import Checkbox from 'antd/es/checkbox';
import Spin from 'antd/es/spin';
import React, { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Card, Tooltip } from 'antd';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { useDi } from 'src/shared/diContext';

import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { useGetTextsByLocale } from 'src/shared/texts';
import { WarningFilled } from '@ant-design/icons';
import { setColumns } from './actions/setColumns';

export const TEXTS = {
  selectColumnsWhereSubTasksProgressShouldBeTracked: {
    en: 'Select columns where sub-tasks progress should be tracked:',
    ru: 'Выберите колонки, где должен отображаться прогресс под-задач:',
  },
  warningTooltip: {
    ru: 'Включите фичу только для тех колонок, где вам реально важно видеть прогресс под-задач. Включение для всех колонок может привести к значительному увеличению нагрузки на Jira и замедлить скорость работы плагина',
    en: 'Enable the feature only for those columns where you really need to see the progress of sub-tasks. Enabling for all columns may lead to significant load on Jira and slow down the plugin',
  },
  noColumnsAvailable: {
    en: 'No columns available',
    ru: 'Нет доступных колонок',
  },
  columnsSettingsTitle: {
    en: 'Select columns for tracking progress',
    ru: 'Выбор колонок для отслеживания прогресса',
  },
  refreshColumns: {
    en: 'Refresh columns',
    ru: 'Обновить колонки',
  },
} as const;

// New component for the columns list
const ColumnsList = ({
  columns,
  onUpdate,
  disabled,
}: {
  columns: { name: string; enabled: boolean }[];
  onUpdate: (updatedColumns: { name: string; enabled: boolean }[]) => void;
  disabled?: boolean;
}) => {
  const texts = useGetTextsByLocale(TEXTS);
  if (columns.length === 0) {
    return <div data-testid="sub-task-progress-no-columns">{texts.noColumnsAvailable}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
      {columns.map(column => (
        <div key={column.name} data-testid="sub-task-progress-column">
          <Checkbox
            data-testid="sub-task-progress-column-checkbox"
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
            <span data-testid="sub-task-progress-column-name">{column.name}</span>
          </Checkbox>
        </div>
      ))}
    </div>
  );
};

export const ColumnsSettingsPure = (props: {
  columns: { name: string; enabled: boolean }[];
  onUpdate: (columns: { name: string; enabled: boolean }[]) => void;
  loading?: boolean;
  disabled?: boolean;
}) => {
  const texts = useGetTextsByLocale(TEXTS);
  return (
    <Card title={texts.columnsSettingsTitle} style={{ marginBottom: '16px' }} type="inner">
      <p style={{ marginBottom: '16px' }}>
        {texts.selectColumnsWhereSubTasksProgressShouldBeTracked}{' '}
        <Tooltip overlayStyle={{ maxWidth: 600 }} title={<p>{texts.warningTooltip}</p>}>
          <span>
            <WarningFilled style={{ color: 'orange' }} size={24} />
          </span>
        </Tooltip>
      </p>
      {props.loading && <Spin />}
      {props.loading ? null : (
        <ColumnsList columns={props.columns} onUpdate={props.onUpdate} disabled={props.disabled} />
      )}
    </Card>
  );
};

export const ColumnsSettingsContainer = () => {
  const boardPagePageObject = useDi().inject(boardPagePageObjectToken) as typeof BoardPagePageObject;
  const [columnsFromBoard, setColumnsFromBoard] = useState<string[]>(boardPagePageObject.getColumns());

  const propertyData = useSubTaskProgressBoardPropertyStore(useShallow(state => state.data));

  const columns = useMemo(() => {
    const columnsToTrack = propertyData?.columnsToTrack || [];
    const columnsToState = columnsFromBoard.map(column => ({
      name: column,
      enabled: columnsToTrack.includes(column),
    }));
    return columnsToState;
  }, [propertyData, columnsFromBoard]);

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
  }, [columnsFromBoard.length]);

  const propertyState = useSubTaskProgressBoardPropertyStore(useShallow(state => state.state));

  return (
    <ColumnsSettingsPure
      columns={columns}
      onUpdate={setColumns}
      loading={propertyState === 'loading' || propertyState === 'initial' || columnsFromBoard.length === 0}
      disabled={!propertyData.enabled}
    />
  );
};
