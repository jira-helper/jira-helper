import React from 'react';
import { Button } from 'antd';
import './gantt-ui.css';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import './gantt-ui.css';

const ERROR_STATE_TEXTS = {
  message: {
    en: 'Failed to load Gantt chart data. Please try refreshing the page.',
    ru: 'Не удалось загрузить данные диаграммы Ганта. Попробуйте обновить страницу.',
  },
  retry: {
    en: 'Retry',
    ru: 'Повторить',
  },
} satisfies Texts<'message' | 'retry'>;

/** Presentation-only error state when Gantt chart data failed to load. */
export type ErrorStateProps = {
  onRetry: () => void;
  errorMessage?: string;
};

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry, errorMessage }) => {
  const texts = useGetTextsByLocale(ERROR_STATE_TEXTS);

  return (
    <div data-testid="gantt-chart-error-state" className="jh-gantt-pad-16">
      <p className="jh-gantt-state-p">{texts.message}</p>
      {errorMessage ? <pre className="jh-gantt-error-pre">{errorMessage}</pre> : null}
      <Button type="primary" onClick={onRetry}>
        {texts.retry}
      </Button>
    </div>
  );
};
