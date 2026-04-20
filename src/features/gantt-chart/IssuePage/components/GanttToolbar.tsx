import React, { useCallback, useId } from 'react';
import { Button, Space, Switch } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import type { TimeInterval } from '../../types';

const INTERVALS: TimeInterval[] = ['hours', 'days', 'weeks', 'months'];

const GANTT_TOOLBAR_TEXTS = {
  zoomIn: {
    en: 'Zoom in',
    ru: 'Увеличить',
  },
  zoomOut: {
    en: 'Zoom out',
    ru: 'Уменьшить',
  },
  zoomReset: {
    en: 'Reset zoom',
    ru: 'Сбросить масштаб',
  },
  intervalLegend: {
    en: 'Time interval',
    ru: 'Интервал времени',
  },
  intervalHours: {
    en: 'Hours',
    ru: 'Часы',
  },
  intervalDays: {
    en: 'Days',
    ru: 'Дни',
  },
  intervalWeeks: {
    en: 'Weeks',
    ru: 'Недели',
  },
  intervalMonths: {
    en: 'Months',
    ru: 'Месяцы',
  },
  statusBreakdown: {
    en: 'Status breakdown',
    ru: 'Разбивка по статусам',
  },
  openSettings: {
    en: 'Gantt settings',
    ru: 'Настройки Ганта',
  },
  openInModal: {
    en: 'Open in modal',
    ru: 'Открыть в модалке',
  },
  closeFullscreen: {
    en: 'Close',
    ru: 'Закрыть',
  },
} satisfies Texts<
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomReset'
  | 'intervalLegend'
  | 'intervalHours'
  | 'intervalDays'
  | 'intervalWeeks'
  | 'intervalMonths'
  | 'statusBreakdown'
  | 'openSettings'
  | 'openInModal'
  | 'closeFullscreen'
>;

const INTERVAL_LABEL_KEYS: Record<TimeInterval, keyof typeof GANTT_TOOLBAR_TEXTS> = {
  hours: 'intervalHours',
  days: 'intervalDays',
  weeks: 'intervalWeeks',
  months: 'intervalMonths',
};

export interface GanttToolbarProps {
  zoomLevel: number;
  interval: TimeInterval;
  statusBreakdownEnabled: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onIntervalChange: (interval: TimeInterval) => void;
  onToggleStatusBreakdown: () => void;
  onOpenSettings: () => void;
  /** Opens fullscreen modal; omit in modal toolbar. */
  onOpenFullscreen?: () => void;
  /** Closes fullscreen modal; omit on inline toolbar. */
  onCloseFullscreen?: () => void;
}

/** Toolbar above the Gantt chart: zoom, time interval, status breakdown, settings. */
export const GanttToolbar: React.FC<GanttToolbarProps> = ({
  zoomLevel,
  interval,
  statusBreakdownEnabled,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onIntervalChange,
  onToggleStatusBreakdown,
  onOpenSettings,
  onOpenFullscreen,
  onCloseFullscreen,
}) => {
  const intervalLabelId = useId();
  const texts = useGetTextsByLocale(GANTT_TOOLBAR_TEXTS);

  const onIntervalInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value as TimeInterval;
      onIntervalChange(value);
    },
    [onIntervalChange]
  );

  const zoomPercent = `${Math.round(zoomLevel * 100)}%`;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
      <Space size="small" wrap>
        <span>{zoomPercent}</span>
        <Button type="default" size="small" onClick={onZoomIn}>
          {texts.zoomIn}
        </Button>
        <Button type="default" size="small" onClick={onZoomOut}>
          {texts.zoomOut}
        </Button>
        <Button type="default" size="small" onClick={onZoomReset}>
          {texts.zoomReset}
        </Button>
      </Space>

      <div
        role="radiogroup"
        aria-labelledby={intervalLabelId}
        style={{ margin: 0, padding: '4px 8px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 4 }}
      >
        <div id={intervalLabelId} style={{ fontSize: 12, marginBottom: 4 }}>
          {texts.intervalLegend}
        </div>
        <Space size="middle" wrap>
          {INTERVALS.map(iv => (
            <label key={iv} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input
                type="radio"
                name="gantt-interval"
                value={iv}
                checked={interval === iv}
                onChange={onIntervalInputChange}
              />
              <span>{texts[INTERVAL_LABEL_KEYS[iv]]}</span>
            </label>
          ))}
        </Space>
      </div>

      <Switch
        checked={statusBreakdownEnabled}
        onChange={() => {
          onToggleStatusBreakdown();
        }}
        aria-label={texts.statusBreakdown}
        size="small"
      />

      {onOpenFullscreen ? (
        <Button
          type="default"
          size="small"
          icon={<FullscreenOutlined aria-hidden />}
          onClick={onOpenFullscreen}
          aria-label={texts.openInModal}
        >
          {texts.openInModal}
        </Button>
      ) : null}

      {onCloseFullscreen ? (
        <Button type="default" size="small" onClick={onCloseFullscreen}>
          {texts.closeFullscreen}
        </Button>
      ) : null}

      <Button type="default" size="small" onClick={onOpenSettings}>
        {texts.openSettings}
      </Button>
    </div>
  );
};
