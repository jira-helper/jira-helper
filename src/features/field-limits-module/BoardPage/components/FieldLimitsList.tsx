import React, { useEffect } from 'react';
import { FieldLimitBadge } from './FieldLimitBadge';
import { boardRuntimeModelToken } from '../../tokens';
import { useDi } from 'src/infrastructure/di/diContext';
import { useGetTextsByLocale } from 'src/shared/texts';
import { FIELD_LIMITS_TEXTS } from '../../texts';
import type { BoardRuntimeModel } from '../models/BoardRuntimeModel';

const containerStyle: React.CSSProperties = {
  display: 'inline-flex',
  marginLeft: 20,
  paddingLeft: 10,
  position: 'absolute',
  borderLeft: '2px solid #f4f5f7',
  flexWrap: 'wrap',
  marginRight: 200,
};

export const FieldLimitsList: React.FC = () => {
  const { model, useModel } = useDi().inject(boardRuntimeModelToken);
  const snap = useModel();
  const actions = model as BoardRuntimeModel;
  const texts = useGetTextsByLocale(FIELD_LIMITS_TEXTS);

  const limitKeys = Object.keys(snap.settings.limits);

  useEffect(() => {
    const statsKeys = Object.keys(snap.stats);
    window.console.log(
      `[jira-helper] FieldLimitsList render: ${limitKeys.length} limits in settings, ${statsKeys.length} in stats. ` +
        `LimitKeys: [${limitKeys.join(', ')}]. StatsKeys: [${statsKeys.join(', ')}]`
    );
    for (const key of limitKeys) {
      const limit = snap.settings.limits[key];
      const hasStats = key in snap.stats;
      window.console.log(
        `[jira-helper]   limit "${key}": fieldId=${limit.fieldId}, calcType=${limit.calcType}, ` +
          `fieldValue="${limit.fieldValue}", columns=[${limit.columns}], swimlanes=[${limit.swimlanes}], ` +
          `hasStats=${hasStats}`
      );
    }
  });

  if (limitKeys.length === 0) return null;

  return (
    <div style={containerStyle} data-testid="field-limits-list">
      {limitKeys.map(limitKey => {
        const limit = snap.settings.limits[limitKey];
        const stats = actions.getLimitStats(limitKey);
        const fieldName =
          snap.cardLayoutFields?.find((f: { fieldId: string }) => f.fieldId === limit.fieldId)?.name ?? limit.fieldId;

        const current = stats?.current ?? 0;
        const limitValue = limit.limit;
        const badgeColor = actions.getBadgeColor(limitKey);
        const tooltip = `${texts.tooltipCurrent}: ${current}\n${texts.tooltipLimit}: ${limitValue}\n${texts.tooltipFieldName}: ${fieldName}\n${texts.tooltipFieldValue}: ${limit.fieldValue}`;

        return (
          <FieldLimitBadge
            key={limitKey}
            visualValue={limit.visualValue}
            current={current}
            limit={limitValue}
            badgeColor={badgeColor}
            bkgColor={limit.bkgColor}
            tooltip={tooltip}
          />
        );
      })}
    </div>
  );
};
