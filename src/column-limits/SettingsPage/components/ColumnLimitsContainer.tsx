import React, { useRef, useCallback } from 'react';
import { useColumnLimitsSettingsUIStore } from '../stores/settingsUIStore';
import { moveColumn } from '../actions';
import type { Column } from '../../types';
import { ColumnLimitsForm } from '../ColumnLimitsForm';
import { WITHOUT_GROUP_ID } from '../../types';
import styles from '../styles.module.css';

export const FORM_IDS = {
  formId: 'jh-wip-limits-form',
  allGroupsId: 'jh-all-groups',
  createGroupDropzoneId: 'jh-column-dropzone',
} as const;

export interface ColumnLimitsContainerProps {
  onColorChange: (groupId: string) => void;
  formRefCallback?: (el: HTMLDivElement | null) => void;
}

export const ColumnLimitsContainer: React.FC<ColumnLimitsContainerProps> = ({ onColorChange, formRefCallback }) => {
  const draggingRef = useRef<{ column: Column; groupId: string } | null>(null);

  const withoutGroupColumns = useColumnLimitsSettingsUIStore(state => state.data.withoutGroupColumns);
  const groups = useColumnLimitsSettingsUIStore(state => state.data.groups);
  const issueTypeSelectorStates = useColumnLimitsSettingsUIStore(state => state.data.issueTypeSelectorStates);
  const actions = useColumnLimitsSettingsUIStore(state => state.actions);

  const handleLimitChange = useCallback(
    (groupId: string, limit: number) => {
      actions.setGroupLimit(groupId, limit);
    },
    [actions]
  );

  const handleIssueTypesChange = useCallback(
    (groupId: string, selectedTypes: string[], countAllTypes: boolean) => {
      actions.setIssueTypeState(groupId, {
        countAllTypes,
        projectKey: issueTypeSelectorStates[groupId]?.projectKey ?? '',
        selectedTypes,
      });
    },
    [actions, issueTypeSelectorStates]
  );

  const handleColumnDragStart = useCallback(
    (e: React.DragEvent, columnId: string, groupId: string) => {
      e.dataTransfer.effectAllowed = 'move';
      const column =
        groupId === WITHOUT_GROUP_ID
          ? withoutGroupColumns.find(c => c.id === columnId)
          : groups.find(g => g.id === groupId)?.columns.find(c => c.id === columnId);
      if (column) {
        draggingRef.current = { column, groupId };
      }
    },
    [withoutGroupColumns, groups]
  );

  const handleColumnDragEnd = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const dragged = draggingRef.current;
    if (!dragged) return;
    const { column, groupId: fromGroupId } = dragged;
    if (fromGroupId !== targetGroupId) {
      moveColumn(column, fromGroupId, targetGroupId);
    }
    draggingRef.current = null;
  }, []);

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
    <ColumnLimitsForm
      withoutGroupColumns={withoutGroupColumns}
      groups={groups}
      issueTypeSelectorStates={issueTypeSelectorStates}
      onLimitChange={handleLimitChange}
      onColorChange={onColorChange}
      onIssueTypesChange={handleIssueTypesChange}
      onColumnDragStart={handleColumnDragStart}
      onColumnDragEnd={handleColumnDragEnd}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      formId={FORM_IDS.formId}
      allGroupsId={FORM_IDS.allGroupsId}
      createGroupDropzoneId={FORM_IDS.createGroupDropzoneId}
      formRefCallback={formRefCallback}
    />
  );
};
