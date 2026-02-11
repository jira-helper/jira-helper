import React, { useState, useRef, useCallback } from 'react';
import { SettingsModal } from './SettingsModal';
import { useColumnLimitsSettingsUIStore } from '../../stores/settingsUIStore';
import { ColumnLimitsForm } from '../../ColumnLimitsForm';
import { moveColumn } from '../../actions';
import { WITHOUT_GROUP_ID } from '../../../types';
import type { Column } from '../../../types';
import styles from '../../styles.module.css';

export type SettingsModalContainerProps = {
  onClose: () => void;
  onSave: () => Promise<void>;
};

export const SettingsModalContainer: React.FC<SettingsModalContainerProps> = ({ onClose, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const draggingRef = useRef<{ column: Column; groupId: string } | null>(null);

  const withoutGroupColumns = useColumnLimitsSettingsUIStore(state => state.data.withoutGroupColumns);
  const groups = useColumnLimitsSettingsUIStore(state => state.data.groups);
  const issueTypeSelectorStates = useColumnLimitsSettingsUIStore(state => state.data.issueTypeSelectorStates);
  const actions = useColumnLimitsSettingsUIStore(state => state.actions);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  // Handlers for ColumnLimitsForm
  const handleLimitChange = useCallback(
    (groupId: string, limit: number) => {
      actions.setGroupLimit(groupId, limit);
    },
    [actions]
  );

  const handleColorChange = useCallback(
    (groupId: string, color: string) => {
      actions.setGroupColor(groupId, color);
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
    // Remove highlight
    const target = e.currentTarget as HTMLElement;
    target.classList.remove(styles.addGroupDropzoneActiveJH);
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
    <SettingsModal title="Limits for groups" onClose={onClose} onSave={handleSave} isSaving={isSaving}>
      <ColumnLimitsForm
        withoutGroupColumns={withoutGroupColumns}
        groups={groups}
        issueTypeSelectorStates={issueTypeSelectorStates}
        onLimitChange={handleLimitChange}
        onColorChange={handleColorChange}
        onIssueTypesChange={handleIssueTypesChange}
        onColumnDragStart={handleColumnDragStart}
        onColumnDragEnd={handleColumnDragEnd}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        formId="jh-wip-limits-form"
        allGroupsId="jh-all-groups"
        createGroupDropzoneId="jh-column-dropzone"
      />
    </SettingsModal>
  );
};
