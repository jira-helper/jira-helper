import React from 'react';
import { Button } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';

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
    <div style={{ padding: '16px' }}>
      <p style={{ marginBottom: '16px' }}>{texts.message}</p>
      {errorMessage ? (
        <pre
          style={{
            marginBottom: '16px',
            padding: '8px',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'var(--ds-surface-sunken, #f4f5f7)',
            borderRadius: '3px',
          }}
        >
          {errorMessage}
        </pre>
      ) : null}
      <Button type="primary" onClick={onRetry}>
        {texts.retry}
      </Button>
    </div>
  );
};
