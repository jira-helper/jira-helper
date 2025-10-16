import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGetTextsByLocale } from 'src/shared/texts';
import { ColumnSelectorContainer } from 'src/shared/components';
import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { setColumns } from './actions/setColumns';

export const TEXTS = {
  selectColumnsWhereSubTasksProgressShouldBeTracked: {
    en: 'Select columns where sub-tasks progress should be tracked:',
    ru: 'Выберите колонки, где должен отображаться прогресс под-задач:',
  },
  columnsSettingsTitle: {
    en: 'Select columns for tracking progress',
    ru: 'Выбор колонок для отслеживания прогресса',
  },
} as const;

export const ColumnsSettingsContainer = () => {
  const propertyData = useSubTaskProgressBoardPropertyStore(useShallow(state => state.data));
  const propertyState = useSubTaskProgressBoardPropertyStore(useShallow(state => state.state));
  const texts = useGetTextsByLocale(TEXTS);

  return (
    <ColumnSelectorContainer
      columnsToTrack={propertyData?.columnsToTrack || []}
      onUpdate={setColumns}
      loading={propertyState === 'loading' || propertyState === 'initial'}
      title={texts.columnsSettingsTitle}
      description={texts.selectColumnsWhereSubTasksProgressShouldBeTracked}
      testIdPrefix="sub-task-progress"
      showWarning
    />
  );
};
