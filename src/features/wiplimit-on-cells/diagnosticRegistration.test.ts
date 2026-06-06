import { beforeEach, describe, expect, it } from 'vitest';
import { Container } from 'dioma';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { useWipLimitCellsPropertyStore } from './property/store';
import type { WipLimitRange } from './types';
import { collectWiplimitOnCellsDiagnosticData, registerWiplimitOnCellsDiagnosticData } from './diagnosticRegistration';

describe('wiplimit-on-cells diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({ token: loggerToken, value: new Logger() });
    useWipLimitCellsPropertyStore.setState(useWipLimitCellsPropertyStore.getInitialState());
    diagnosticModule.ensure(container);
    registerWiplimitOnCellsDiagnosticData(container);
  });

  it('registers wiplimit-on-cells diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('wiplimit-on-cells');
  });

  it('returns §5.3 payload with wipLimitCells board property snapshot', () => {
    const boardData: WipLimitRange[] = [
      {
        name: 'Range A',
        wipLimit: 3,
        cells: [{ column: 'col-1', swimlane: 'sw-1', showBadge: true }],
      },
    ];
    useWipLimitCellsPropertyStore.getState().actions.setData(boardData);
    useWipLimitCellsPropertyStore.getState().actions.setState('loaded');

    const result = collectWiplimitOnCellsDiagnosticData();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const payload = result.val;
    expect(payload).toEqual({
      settings: {
        boardProperty: {
          propertyKey: BOARD_PROPERTIES.WIP_LIMITS_CELLS,
          state: 'loaded',
          data: boardData,
        },
        localStorage: null,
      },
      runtime: null,
    });
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('collects via DiagnosticModel with current store snapshot', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    const report = diagnosticModel.collectDiagnosticReport();

    expect(report['wiplimit-on-cells']).toEqual({
      settings: {
        boardProperty: {
          propertyKey: BOARD_PROPERTIES.WIP_LIMITS_CELLS,
          state: 'initial',
          data: useWipLimitCellsPropertyStore.getState().data,
        },
        localStorage: null,
      },
      runtime: null,
    });
  });
});
