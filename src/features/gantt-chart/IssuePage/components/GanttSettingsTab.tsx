import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Space, Switch, Typography } from 'antd';
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
  title: { en: 'Gantt Chart', ru: 'Диаграмма Ганта' },
  featureEnabled: { en: 'Feature enabled', ru: 'Функция включена' },
  featureDisabledHint: {
    en: 'Gantt is disabled locally in this browser. Your saved Gantt settings are kept and will be used after re-enabling.',
    ru: 'Gantt локально отключён в этом браузере. Сохранённые настройки Gantt не удаляются и будут применены после включения.',
  },
  save: { en: 'Save', ru: 'Сохранить' },
  copyFrom: { en: 'Copy from…', ru: 'Копировать из…' },
} satisfies Texts<'title' | 'featureEnabled' | 'featureDisabledHint' | 'save' | 'copyFrom'>;

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
  const handleFeatureToggle = useCallback(
    (enabled: boolean) => {
      model.setFeatureEnabled(enabled);
    },
    [model]
  );

  return (
    <div className="jh-gantt-settings-tab jh-gantt-local-toggle-section">
      <div className="jh-gantt-local-toggle-header">
        <Typography.Title level={5} className="jh-gantt-local-toggle-title">
          {texts.title}
        </Typography.Title>
        <label htmlFor="gantt-local-toggle" className="jh-gantt-local-toggle-control">
          <Typography.Text>{texts.featureEnabled}</Typography.Text>
          <Switch
            id="gantt-local-toggle"
            checked={snap.featureEnabled}
            onChange={handleFeatureToggle}
            data-testid="gantt-local-toggle-switch"
          />
        </label>
      </div>

      {snap.featureEnabled ? (
        <>
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
        </>
      ) : (
        <Typography.Text type="secondary" data-testid="gantt-local-toggle-disabled-hint">
          {texts.featureDisabledHint}
        </Typography.Text>
      )}
    </div>
  );
};
