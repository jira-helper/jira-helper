import React, { useCallback, useMemo } from 'react';
import { Card } from 'antd';
import {
  StatusProgressMappingSection,
  type StatusProgressMappingSectionProps,
} from 'src/shared/status-progress-mapping/components/StatusProgressMappingSection';
import type { StatusProgressMapping, StatusProgressMappingRow } from 'src/shared/status-progress-mapping/types';
import { useGetStatuses } from 'src/shared/jira/stores/useGetStatuses';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useGetSettings } from '../../SubTaskProgressSettings/hooks/useGetSettings';
import { useSubTaskProgressBoardPropertyStore } from '../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import styles from './StatusProgressMappingContainer.module.css';

const TEXTS = {
  title: {
    en: 'Status progress mapping',
    ru: 'Маппинг прогресса по статусу',
  },
  description: {
    en: 'Choose how Jira statuses should count in sub-tasks progress. Blocked is still controlled by flag/link settings.',
    ru: 'Выберите, как статусы Jira учитываются в прогрессе подзадач. Blocked по-прежнему управляется настройками флагов/ссылок.',
  },
  addStatusMapping: {
    en: '+ Add status mapping',
    ru: '+ Добавить маппинг статуса',
  },
  statusLabel: {
    en: 'Jira status',
    ru: 'Статус Jira',
  },
  bucketLabel: {
    en: 'Progress bucket',
    ru: 'Бакет прогресса',
  },
  selectStatusPlaceholder: {
    en: 'Select Jira status',
    ru: 'Выберите статус Jira',
  },
  selectBucketPlaceholder: {
    en: 'Select bucket',
    ru: 'Выберите бакет',
  },
  removeRow: {
    en: 'Remove status mapping',
    ru: 'Удалить маппинг статуса',
  },
  noStatusFound: {
    en: 'No status found',
    ru: 'Статус не найден',
  },
};

function mappingToRows(mapping: StatusProgressMapping | undefined): StatusProgressMappingRow[] {
  return Object.values(mapping ?? {});
}

function rowsToMapping(rows: StatusProgressMappingRow[]): StatusProgressMapping {
  return rows.reduce<StatusProgressMapping>((acc, row) => {
    const statusId = row.statusId.trim();
    if (!statusId) return acc;
    acc[statusId] = {
      statusId,
      statusName: row.statusName,
      bucket: row.bucket,
    };
    return acc;
  }, {});
}

export const StatusProgressMappingContainer = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { settings } = useGetSettings();
  const { statuses, isLoading } = useGetStatuses();
  const { setStatusProgressMapping, removeStatusProgressMapping, clearStatusProgressMapping } =
    useSubTaskProgressBoardPropertyStore(state => state.actions);

  const persistedRows = useMemo(() => mappingToRows(settings.statusProgressMapping), [settings.statusProgressMapping]);
  const [rows, setRows] = React.useState<StatusProgressMappingRow[]>(persistedRows);

  React.useEffect(() => {
    setRows(persistedRows);
  }, [persistedRows]);

  const sectionTexts: StatusProgressMappingSectionProps['texts'] = {
    statusLabel: texts.statusLabel,
    bucketLabel: texts.bucketLabel,
    selectStatusPlaceholder: texts.selectStatusPlaceholder,
    selectBucketPlaceholder: texts.selectBucketPlaceholder,
    removeRow: texts.removeRow,
    noStatusFound: texts.noStatusFound,
  };

  const handleChange = useCallback(
    (nextRows: StatusProgressMappingRow[]) => {
      setRows(nextRows);
      const nextMapping = rowsToMapping(nextRows);
      const currentIds = new Set(rows.map(row => row.statusId).filter(Boolean));
      const nextIds = new Set(nextRows.map(row => row.statusId).filter(Boolean));
      const removedIds = [...currentIds].filter(statusId => !nextIds.has(statusId));

      if (nextRows.length === 0 || Object.keys(nextMapping).length === 0) {
        if (currentIds.size === 0 && nextRows.length > 0) {
          return;
        }
        clearStatusProgressMapping();
        return;
      }

      if (removedIds.length > 0) {
        for (const statusId of removedIds) {
          removeStatusProgressMapping(statusId);
        }
        if (Object.keys(nextMapping).length === rows.length - removedIds.length) {
          return;
        }
      }

      setStatusProgressMapping(nextMapping);
    },
    [clearStatusProgressMapping, removeStatusProgressMapping, rows, setStatusProgressMapping]
  );

  return (
    <Card className={styles.card} type="inner" data-testid="subtasks-status-progress-mapping-card">
      <StatusProgressMappingSection
        title={texts.title}
        description={texts.description}
        addButtonLabel={texts.addStatusMapping}
        rows={rows}
        statuses={statuses}
        isLoadingStatuses={isLoading}
        disabled={!settings.enabled}
        onChange={handleChange}
        texts={sectionTexts}
      />
    </Card>
  );
};
