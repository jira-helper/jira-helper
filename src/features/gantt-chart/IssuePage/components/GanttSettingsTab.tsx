import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Space } from 'antd';
import { globalContainer } from 'dioma';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import { ganttDataModelToken, ganttSettingsModelToken } from '../../tokens';
import type { GanttScopeSettings, SettingsScope } from '../../types';
import { buildScopeKey } from '../../utils/resolveSettings';
import { GanttSettingsFormContent } from './GanttSettingsModal';
import { CopyFromDialog } from './CopyFromDialog';
import './gantt-ui.css';

const TAB_TEXTS = {
  save: { en: 'Save', ru: 'Сохранить' },
  copyFrom: { en: 'Copy from…', ru: 'Копировать из…' },
} satisfies Texts<'save' | 'copyFrom'>;

function labelForScopeKey(key: string): string {
  if (key === '_global') return 'Global';
  const colon = key.indexOf(':');
  if (colon === -1) return `Project ${key}`;
  return `${key.slice(0, colon)} / ${key.slice(colon + 1)}`;
}

/**
 * Gantt tab content for the Issue Settings tabbed modal.
 * Embeds {@link GanttSettingsFormContent} inline with save/copyFrom controls.
 */
export const GanttSettingsTab: React.FC = () => {
  const texts = useGetTextsByLocale(TAB_TEXTS);

  const { model, useModel } = globalContainer.inject(ganttSettingsModelToken);
  const { model: dataModel } = globalContainer.inject(ganttDataModelToken);
  const snap = useModel();
  const [copyFromVisible, setCopyFromVisible] = useState(false);

  useEffect(() => {
    model.syncScopeToEffectiveAndOpenDraft();
  }, [model]);

  const currentScopeKey = useMemo(
    () =>
      snap.currentScope.level === 'global'
        ? buildScopeKey()
        : snap.currentScope.level === 'project'
          ? buildScopeKey(snap.currentScope.projectKey)
          : buildScopeKey(snap.currentScope.projectKey, snap.currentScope.issueType),
    [snap.currentScope]
  );

  const availableScopes = useMemo(
    () =>
      Object.entries(snap.storage)
        .filter(([k, v]) => v != null && k !== currentScopeKey)
        .map(([key]) => ({ key, label: labelForScopeKey(key) })),
    [snap.storage, currentScopeKey]
  );

  const handleDraftChange = useCallback(
    (patch: Partial<GanttScopeSettings>) => {
      if (model.draftSettings === null) return;
      Object.assign(model.draftSettings, patch);
    },
    [model]
  );

  const handleSave = useCallback(() => {
    model.saveDraft();
    const resolved = model.resolvedSettings;
    if (resolved !== null) dataModel.recompute(resolved);
  }, [model, dataModel]);

  const handleScopeLevelChange = useCallback(
    (level: SettingsScope['level']) => {
      model.setScopeLevel(level);
    },
    [model]
  );

  const handleCopyConfirm = useCallback(
    (sourceKey: string) => {
      model.copyFromScope(sourceKey);
      setCopyFromVisible(false);
    },
    [model]
  );

  return (
    <div className="jh-gantt-settings-tab">
      <GanttSettingsFormContent
        draft={snap.draftSettings}
        currentScope={snap.currentScope}
        onDraftChange={handleDraftChange}
        onScopeLevelChange={handleScopeLevelChange}
      />
      <Space className="jh-gantt-space-mt-16">
        <Button onClick={() => setCopyFromVisible(true)}>{texts.copyFrom}</Button>
        <Button type="primary" onClick={handleSave} disabled={!snap.draftSettings}>
          {texts.save}
        </Button>
      </Space>
      <CopyFromDialog
        visible={copyFromVisible}
        availableScopes={availableScopes}
        onCopy={handleCopyConfirm}
        onCancel={() => setCopyFromVisible(false)}
      />
    </div>
  );
};
