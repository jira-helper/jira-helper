import { useState, useEffect, useMemo } from 'react';
import { useDi } from 'src/shared/diContext';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';
import { DaysInColumnSettings } from '../../types';

export interface UseDaysInColumnSettingsReturn {
  daysInColumn: DaysInColumnSettings;
  columnsToTrack: string[];
  boardColumns: string[];
  columnsForThresholds: Array<{ name: string; existsOnBoard: boolean }>;
  hasInvalidGlobalThresholds: boolean;
  handleEnabledChange: (checked: boolean) => void;
  handleWarningThresholdChange: (value: number | null) => void;
  handleDangerThresholdChange: (value: number | null) => void;
  handleUsePerColumnThresholdsChange: (checked: boolean) => void;
  handleColumnWarningChange: (columnName: string, value: number | null) => void;
  handleColumnDangerChange: (columnName: string, value: number | null) => void;
  handleRemoveColumn: (columnName: string) => void;
}

export function useDaysInColumnSettings(): UseDaysInColumnSettingsReturn {
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
        return true; // Columns found
      }
      return false; // No columns found
    };

    const columnsFound = getColumns();

    // Retry periodically if no columns found
    if (!columnsFound) {
      const interval = setInterval(() => {
        const found = getColumns();
        if (found) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [boardPagePageObject]);

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
  const columnsForThresholds = useMemo(() => {
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

  return {
    daysInColumn,
    columnsToTrack,
    boardColumns,
    columnsForThresholds,
    hasInvalidGlobalThresholds,
    handleEnabledChange,
    handleWarningThresholdChange,
    handleDangerThresholdChange,
    handleUsePerColumnThresholdsChange,
    handleColumnWarningChange,
    handleColumnDangerChange,
    handleRemoveColumn,
  };
}
