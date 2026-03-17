import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from 'dioma';
import { FieldLimitsList } from './FieldLimitsList';
import { WithDi } from 'src/shared/diContext';
import { boardRuntimeModelToken } from '../../tokens';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import type { FieldLimitsSettings, FieldLimitStats, CardLayoutField } from '../../types';
import { CalcType } from '../../types';
import type { BoardRuntimeModel } from '../models/BoardRuntimeModel';

const createMockBoardRuntimeModel = (overrides: {
  settings?: FieldLimitsSettings;
  cardLayoutFields?: CardLayoutField[];
  getLimitStats?: (limitKey: string) => FieldLimitStats | undefined;
  getBadgeColor?: (limitKey: string) => string;
}) => {
  const defaultSettings: FieldLimitsSettings = overrides.settings ?? { limits: {} };
  const defaultCardLayoutFields: CardLayoutField[] = overrides.cardLayoutFields ?? [];
  const defaultGetLimitStats = overrides.getLimitStats ?? vi.fn().mockReturnValue(undefined);
  const defaultGetBadgeColor = overrides.getBadgeColor ?? vi.fn().mockReturnValue('#1b855c');

  const snap = {
    settings: defaultSettings,
    stats: {},
    isInitialized: true,
    cardLayoutFields: defaultCardLayoutFields,
  };

  const model = {
    ...snap,
    getLimitStats: defaultGetLimitStats,
    getBadgeColor: defaultGetBadgeColor,
  };

  return {
    model: model as unknown as Readonly<BoardRuntimeModel>,
    useModel: () => snap as unknown as Readonly<BoardRuntimeModel>,
  };
};

describe('FieldLimitsList', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({
      token: localeProviderToken,
      value: new MockLocaleProvider('en'),
    });
  });

  const renderWithProvider = (modelOverrides: Parameters<typeof createMockBoardRuntimeModel>[0] = {}) => {
    const mock = createMockBoardRuntimeModel(modelOverrides);
    container.register({
      token: boardRuntimeModelToken,
      value: mock,
    });

    return render(
      <WithDi container={container}>
        <FieldLimitsList />
      </WithDi>
    );
  };

  it('should return null when no limits', () => {
    renderWithProvider({ settings: { limits: {} } });
    expect(screen.queryByTestId('field-limits-list')).not.toBeInTheDocument();
  });

  it('should render FieldLimitBadge for each limit', () => {
    const limits = {
      'fieldId:Pro': {
        calcType: CalcType.EXACT_VALUE,
        fieldId: 'priority',
        fieldValue: 'Pro',
        visualValue: 'Pro',
        limit: 5,
        columns: [],
        swimlanes: [],
      },
      'fieldId:Bug': {
        calcType: CalcType.EXACT_VALUE,
        fieldId: 'priority',
        fieldValue: 'Bug',
        visualValue: 'Bug',
        limit: 3,
        columns: [],
        swimlanes: [],
      },
    };
    const cardLayoutFields: CardLayoutField[] = [{ fieldId: 'priority', name: 'Priority' }];
    const getLimitStats = vi.fn((limitKey: string): FieldLimitStats | undefined => {
      if (limitKey === 'fieldId:Pro')
        return {
          current: 2,
          limit: 5,
          isOverLimit: false,
          isOnLimit: false,
          calcType: CalcType.EXACT_VALUE,
        };
      if (limitKey === 'fieldId:Bug')
        return {
          current: 1,
          limit: 3,
          isOverLimit: false,
          isOnLimit: false,
          calcType: CalcType.EXACT_VALUE,
        };
      return undefined;
    });
    const getBadgeColor = vi.fn().mockReturnValue('#1b855c');

    renderWithProvider({
      settings: { limits },
      cardLayoutFields,
      getLimitStats,
      getBadgeColor,
    });

    expect(screen.getByTestId('field-limits-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('field-limit-badge')).toHaveLength(2);
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
  });

  it('should format tooltip correctly', () => {
    const limits = {
      'priority:Pro': {
        calcType: CalcType.EXACT_VALUE,
        fieldId: 'priority',
        fieldValue: 'Pro',
        visualValue: 'Pro',
        limit: 5,
        columns: [],
        swimlanes: [],
      },
    };
    const cardLayoutFields: CardLayoutField[] = [{ fieldId: 'priority', name: 'Priority' }];
    const getLimitStats = vi.fn().mockReturnValue({
      current: 2,
      limit: 5,
      isOverLimit: false,
      isOnLimit: false,
      calcType: CalcType.EXACT_VALUE,
      issues: [],
    });
    const getBadgeColor = vi.fn().mockReturnValue('#1b855c');

    renderWithProvider({
      settings: { limits },
      cardLayoutFields,
      getLimitStats,
      getBadgeColor,
    });

    expect(screen.getByText('2/5')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('should use fieldId when field name not found in cardLayoutFields', () => {
    const limits = {
      'unknown:val': {
        calcType: CalcType.EXACT_VALUE,
        fieldId: 'unknown',
        fieldValue: 'val',
        visualValue: 'val',
        limit: 3,
        columns: [],
        swimlanes: [],
      },
    };
    const getLimitStats = vi.fn().mockReturnValue({
      current: 1,
      limit: 3,
      isOverLimit: false,
      isOnLimit: false,
      calcType: CalcType.EXACT_VALUE,
      issues: [],
    });
    const getBadgeColor = vi.fn().mockReturnValue('#1b855c');

    renderWithProvider({
      settings: { limits },
      cardLayoutFields: [],
      getLimitStats,
      getBadgeColor,
    });

    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('val')).toBeInTheDocument();
  });

  it('should use current 0 when stats is undefined', () => {
    const limits = {
      'f:v': {
        calcType: CalcType.EXACT_VALUE,
        fieldId: 'f',
        fieldValue: 'v',
        visualValue: 'v',
        limit: 5,
        columns: [],
        swimlanes: [],
      },
    };
    const getLimitStats = vi.fn().mockReturnValue(undefined);
    const getBadgeColor = vi.fn().mockReturnValue('#1b855c');

    renderWithProvider({
      settings: { limits },
      cardLayoutFields: [{ fieldId: 'f', name: 'Field' }],
      getLimitStats,
      getBadgeColor,
    });

    expect(screen.getByText('0/5')).toBeInTheDocument();
    expect(screen.getByText('v')).toBeInTheDocument();
  });
});
