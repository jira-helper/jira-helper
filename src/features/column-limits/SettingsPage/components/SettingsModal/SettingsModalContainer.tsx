import React, { useState, useRef, useCallback } from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useDi } from 'src/shared/diContext';
import { SettingsModal } from './SettingsModal';
import { settingsUIModelToken } from '../../../tokens';
import type { SettingsUIModel } from '../../models/SettingsUIModel';
import { ColumnLimitsForm } from '../../ColumnLimitsForm';
import { WITHOUT_GROUP_ID } from '../../../types';
import { COLUMN_LIMITS_TEXTS } from '../../texts';
import type { Column } from '../../../types';
import styles from '../../styles.module.css';

export type SettingsModalContainerProps = {
  onClose: () => void;
  onSave: () => Promise<void>;
  swimlanes?: Array<{ id: string; name: string }>;
};

export const SettingsModalContainer: React.FC<SettingsModalContainerProps> = ({ onClose, onSave, swimlanes = [] }) => {
  const texts = useGetTextsByLocale(COLUMN_LIMITS_TEXTS);
  const [isSaving, setIsSaving] = useState(false);
  const draggingRef = useRef<{ column: Column; groupId: string } | null>(null);
  const { model, useModel } = useDi().inject(settingsUIModelToken);
  const snap = useModel();
  const actions = model as SettingsUIModel;

  const { withoutGroupColumns } = snap;
  const { groups } = snap;
  const { issueTypeSelectorStates } = snap;

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

  const handleDrop = useCallback(
    (e: React.DragEvent, targetGroupId: string) => {
      e.preventDefault();
      e.stopPropagation();
      const dragged = draggingRef.current;
      if (!dragged) return;
      const { column, groupId: fromGroupId } = dragged;
      if (fromGroupId !== targetGroupId) {
        actions.moveColumn(column, fromGroupId, targetGroupId);
      }
      draggingRef.current = null;
      // Remove highlight
      const target = e.currentTarget as HTMLElement;
      target.classList.remove(styles.addGroupDropzoneActiveJH);
    },
    [actions]
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

  const handleSwimlanesChange = useCallback(
    (groupId: string, selectedSwimlanes: Array<{ id: string; name: string }>) => {
      actions.setGroupSwimlanes(groupId, selectedSwimlanes);
    },
    [actions]
  );

  return (
    <SettingsModal
      title={texts.modalTitle}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
      okButtonText={texts.save}
      cancelButtonText={texts.cancel}
    >
      <ColumnLimitsForm
        withoutGroupColumns={withoutGroupColumns}
        groups={groups}
        issueTypeSelectorStates={issueTypeSelectorStates}
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
        formId="jh-wip-limits-form"
        allGroupsId="jh-all-groups"
        createGroupDropzoneId="jh-column-dropzone"
      />
    </SettingsModal>
  );
};
