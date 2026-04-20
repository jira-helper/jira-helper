import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Container } from 'dioma';
import { ganttDataModelToken, ganttSettingsModelToken } from '../../tokens';
import type { GanttScopeSettings, SettingsScope } from '../../types';
import { buildScopeKey } from '../../utils/resolveSettings';
import { CopyFromDialog } from './CopyFromDialog';
import { GanttSettingsModal } from './GanttSettingsModal';

function scopeKeyFromScope(scope: SettingsScope): string {
  if (scope.level === 'global') {
    return buildScopeKey();
  }
  if (scope.level === 'project') {
    return buildScopeKey(scope.projectKey);
  }
  return buildScopeKey(scope.projectKey, scope.issueType);
}

function labelForScopeKey(key: string): string {
  if (key === '_global') {
    return 'Global';
  }
  const colon = key.indexOf(':');
  if (colon === -1) {
    return `Project ${key}`;
  }
  return `${key.slice(0, colon)} / ${key.slice(colon + 1)}`;
}

export interface GanttSettingsContainerProps {
  container: Container;
  visible: boolean;
  onClose: () => void;
}

/** Wires {@link GanttSettingsModal} and {@link CopyFromDialog} to {@link GanttSettingsModel}. */
export const GanttSettingsContainer: React.FC<GanttSettingsContainerProps> = ({ container, visible, onClose }) => {
  const { model, useModel } = container.inject(ganttSettingsModelToken);
  const { model: dataModel } = container.inject(ganttDataModelToken);
  const snap = useModel();
  const [copyFromVisible, setCopyFromVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      model.openDraft();
    } else {
      setCopyFromVisible(false);
    }
  }, [visible, model]);

  const currentScopeKey = useMemo(() => scopeKeyFromScope(snap.currentScope), [snap.currentScope]);

  const availableScopes = useMemo(
    () =>
      Object.entries(snap.storage)
        .filter(([k, v]) => v != null && k !== currentScopeKey)
        .map(([key]) => ({ key, label: labelForScopeKey(key) })),
    [snap.storage, currentScopeKey]
  );

  const handleDraftChange = useCallback(
    (patch: Partial<GanttScopeSettings>) => {
      if (model.draftSettings === null) {
        return;
      }
      Object.assign(model.draftSettings, patch);
    },
    [model]
  );

  const handleSave = useCallback(() => {
    model.saveDraft();
    const resolved = model.resolvedSettings;
    if (resolved !== null) {
      dataModel.recompute(resolved);
    }
    onClose();
  }, [model, dataModel, onClose]);

  const handleScopeLevelChange = useCallback(
    (level: SettingsScope['level']) => {
      model.setScopeLevel(level);
    },
    [model]
  );

  const handleCopyFromOpen = useCallback(() => {
    setCopyFromVisible(true);
  }, []);

  const handleCopyConfirm = useCallback(
    (sourceKey: string) => {
      model.copyFromScope(sourceKey);
      setCopyFromVisible(false);
    },
    [model]
  );

  const handleCopyCancel = useCallback(() => {
    setCopyFromVisible(false);
  }, []);

  return (
    <>
      <GanttSettingsModal
        visible={visible}
        draft={snap.draftSettings}
        currentScope={snap.currentScope}
        onDraftChange={handleDraftChange}
        onSave={handleSave}
        onCancel={onClose}
        onScopeLevelChange={handleScopeLevelChange}
        onCopyFrom={handleCopyFromOpen}
      />
      <CopyFromDialog
        visible={copyFromVisible}
        availableScopes={availableScopes}
        onCopy={handleCopyConfirm}
        onCancel={handleCopyCancel}
      />
    </>
  );
};
