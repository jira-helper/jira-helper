import React from 'react';
import { FieldLimitBadge } from './FieldLimitBadge';
import { boardRuntimeModelToken } from '../../tokens';
import { useDi } from 'src/shared/diContext';
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

  const limitKeys = Object.keys(snap.settings.limits);

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
        const tooltip = `current: ${current}\nlimit: ${limitValue}\nfield name: ${fieldName}\nfield value: ${limit.fieldValue}`;

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
