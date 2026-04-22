import React from 'react';
import { Button } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';

const FIRST_RUN_TEXTS = {
  message: {
    en: 'Gantt chart is not configured yet. Please configure start and end date mappings.',
    ru: 'Диаграмма Ганта ещё не настроена. Настройте сопоставление полей дат начала и окончания.',
  },
  openSettings: {
    en: 'Open Settings',
    ru: 'Открыть настройки',
  },
} satisfies Texts<'message' | 'openSettings'>;

/** Presentation-only first-run placeholder for the Gantt chart (FR-3 / S1). */
export type FirstRunStateProps = {
  /** Opens the Gantt settings UI (wired in the container). */
  onOpenSettings: () => void;
};

export const FirstRunState: React.FC<FirstRunStateProps> = ({ onOpenSettings }) => {
  const texts = useGetTextsByLocale(FIRST_RUN_TEXTS);

  return (
    <div style={{ padding: '16px' }}>
      <p style={{ marginBottom: '16px' }}>{texts.message}</p>
      <Button type="primary" data-testid="gantt-first-run-open-settings" onClick={onOpenSettings}>
        {texts.openSettings}
      </Button>
    </div>
  );
};
