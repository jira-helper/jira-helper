/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Button, Space } from 'antd';
import { useDi } from 'src/infrastructure/di/diContext';
import { useGetTextsByLocale } from 'src/shared/texts';
import { settingsUIModelToken, propertyModelToken, boardRuntimeModelToken } from '../tokens';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { ColumnLimitsForm } from '../SettingsPage/ColumnLimitsForm';
import { buildInitDataFromColumns } from '../SettingsPage/utils/buildInitData';
import { WITHOUT_GROUP_ID } from '../types';
import type { Column } from '../types';
import type { SettingsUIModel } from '../SettingsPage/models/SettingsUIModel';
import type { BoardRuntimeModel } from '../BoardPage/models/BoardRuntimeModel';
import { COLUMN_LIMITS_TEXTS } from '../SettingsPage/texts';
import styles from '../SettingsPage/styles.module.css';

export type ColumnLimitsSettingsTabProps = {
  swimlanes: Array<{ id: string; name: string }>;
};

export const ColumnLimitsSettingsTab: React.FC<ColumnLimitsSettingsTabProps> = ({ swimlanes }) => {
  const texts = useGetTextsByLocale(COLUMN_LIMITS_TEXTS);
  const [isSaving, setIsSaving] = useState(false);
  const draggingRef = useRef<{ column: Column; groupId: string } | null>(null);

  const container = useDi();
  const { model: propertyModel } = container.inject(propertyModelToken);
  const { model, useModel } = container.inject(settingsUIModelToken);
  const { model: runtimeModel } = container.inject(boardRuntimeModelToken);
  const boardPagePO = container.inject(boardPagePageObjectToken);

  const settingsUi = model as SettingsUIModel;
  const snap = useModel();

  useEffect(() => {
    const columns = boardPagePO.getOrderedColumns();
    const wipLimits = propertyModel.data;
    const initData = buildInitDataFromColumns(columns, wipLimits);
    settingsUi.reset();
    settingsUi.initFromProperty(initData);
    // Mount-only bootstrap: columns/property are stable for the tab session; re-running would wipe in-flight edits.
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const columnIds = boardPagePO.getOrderedColumnIds();
      await settingsUi.save(columnIds);
      (runtimeModel as BoardRuntimeModel).apply();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    settingsUi.reset();
    const columns = boardPagePO.getOrderedColumns();
    const wipLimits = propertyModel.data;
    const initData = buildInitDataFromColumns(columns, wipLimits);
    settingsUi.initFromProperty(initData);
  };

  const handleLimitChange = useCallback(
    (groupId: string, limit: number) => {
      settingsUi.setGroupLimit(groupId, limit);
    },
    [settingsUi]
  );

  const handleColorChange = useCallback(
    (groupId: string, color: string) => {
      settingsUi.setGroupColor(groupId, color);
    },
    [settingsUi]
  );

  const handleIssueTypesChange = useCallback(
    (groupId: string, selectedTypes: string[], countAllTypes: boolean) => {
      settingsUi.setIssueTypeState(groupId, {
        countAllTypes,
        projectKey: snap.issueTypeSelectorStates[groupId]?.projectKey ?? '',
        selectedTypes,
      });
    },
    [settingsUi, snap.issueTypeSelectorStates]
  );

  const handleSwimlanesChange = useCallback(
    (groupId: string, selectedSwimlanes: Array<{ id: string; name: string }>) => {
      settingsUi.setGroupSwimlanes(groupId, selectedSwimlanes);
    },
    [settingsUi]
  );

  const handleColumnDragStart = useCallback(
    (e: React.DragEvent, columnId: string, groupId: string) => {
      e.dataTransfer.effectAllowed = 'move';
      const column =
        groupId === WITHOUT_GROUP_ID
          ? snap.withoutGroupColumns.find(c => c.id === columnId)
          : snap.groups.find(g => g.id === groupId)?.columns.find(c => c.id === columnId);
      if (column) {
        draggingRef.current = { column, groupId };
      }
    },
    [snap.withoutGroupColumns, snap.groups]
  );

  const handleColumnDragEnd = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetGroupId: string) => {
      e.preventDefault();
      e.stopPropagation();
      const dragged = draggingRef.current;
      if (!dragged) return;
      const { column, groupId: fromGroupId } = dragged;
      if (fromGroupId !== targetGroupId) {
        settingsUi.moveColumn(column, fromGroupId, targetGroupId);
      }
      draggingRef.current = null;
      const target = e.currentTarget as HTMLElement;
      target.classList.remove(styles.addGroupDropzoneActiveJH);
    },
    [settingsUi]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target.classList.contains('dropzone-jh')) {
      target.classList.add(styles.addGroupDropzoneActiveJH);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove(styles.addGroupDropzoneActiveJH);
  }, []);

  return (
    <div>
      <ColumnLimitsForm
        withoutGroupColumns={snap.withoutGroupColumns}
        groups={snap.groups}
        issueTypeSelectorStates={snap.issueTypeSelectorStates}
        swimlanes={swimlanes}
        onLimitChange={handleLimitChange}
        onColorChange={handleColorChange}
        onSwimlanesChange={handleSwimlanesChange}
        onIssueTypesChange={handleIssueTypesChange}
        onColumnDragStart={handleColumnDragStart}
        onColumnDragEnd={handleColumnDragEnd}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        formId="jh-wip-limits-tab-form"
        allGroupsId="jh-tab-all-groups"
        createGroupDropzoneId="jh-tab-column-dropzone"
      />
      <Space style={{ marginTop: 16, width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={handleSave} loading={isSaving}>
          {texts.saveConfig}
        </Button>
        <Button onClick={handleCancel} disabled={isSaving}>
          {texts.discardChanges}
        </Button>
      </Space>
    </div>
  );
};
