import React from 'react';
import { Button } from 'antd';
import './gantt-ui.css';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import './gantt-ui.css';

const EMPTY_STATE_TEXTS = {
  message: {
    en: 'No subtasks found for this issue. The Gantt chart requires subtasks, epic children, or linked issues.',
    ru: 'Для этой задачи не найдено подзадач. Диаграмма Ганта требует подзадачи, дочерние задачи эпика или связанные задачи.',
  },
  openSettings: {
    en: 'Open Settings',
    ru: 'Открыть настройки',
  },
} satisfies Texts<'message' | 'openSettings'>;

export interface EmptyStateProps {
  onOpenSettings?: () => void;
}

/** Empty state when Gantt settings exist but there are no tasks to show; offers settings access. */
export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenSettings }) => {
  const texts = useGetTextsByLocale(EMPTY_STATE_TEXTS);

  return (
    <div data-testid="gantt-empty-state" className="jh-gantt-pad-16">
      <p className={onOpenSettings ? 'jh-gantt-state-p' : 'jh-gantt-state-p--tight'}>{texts.message}</p>
      {onOpenSettings ? (
        <Button type="default" onClick={onOpenSettings}>
          {texts.openSettings}
        </Button>
      ) : null}
    </div>
  );
};
