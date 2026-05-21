import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Container } from 'dioma';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { useAdditionalCardElementsBoardPropertyStore } from './stores/additionalCardElementsBoardProperty';
import {
  ADDITIONAL_CARD_ELEMENTS_BOARD_PROPERTY_KEY,
  collectAdditionalCardElementsDiagnosticData,
  registerAdditionalCardElementsDiagnosticData,
} from './diagnosticRegistration';

describe('additional-card-elements diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({ token: loggerToken, value: new Logger() });
    useAdditionalCardElementsBoardPropertyStore.setState(useAdditionalCardElementsBoardPropertyStore.getInitialState());
    diagnosticModule.ensure(container);
    registerAdditionalCardElementsDiagnosticData(container);
  });

  it('registers additional-card-elements diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('additional-card-elements');
  });

  it('returns §5.3 payload with board property snapshot only', () => {
    const boardData = {
      ...useAdditionalCardElementsBoardPropertyStore.getState().data,
      enabled: true,
      columnsToTrack: ['In Progress'],
      showInBacklog: true,
    };
    useAdditionalCardElementsBoardPropertyStore.getState().actions.setData(boardData);
    useAdditionalCardElementsBoardPropertyStore.getState().actions.setState('loaded');

    const result = collectAdditionalCardElementsDiagnosticData();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const payload = result.val;
    expect(payload).toEqual({
      settings: {
        boardProperty: {
          propertyKey: ADDITIONAL_CARD_ELEMENTS_BOARD_PROPERTY_KEY,
          state: 'loaded',
          data: boardData,
        },
        localStorage: null,
      },
      runtime: null,
    });
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('collects via DiagnosticModel without loading board property', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);
    const setStateSpy = vi.spyOn(useAdditionalCardElementsBoardPropertyStore.getState().actions, 'setState');

    const report = diagnosticModel.collectDiagnosticReport();

    expect(setStateSpy).not.toHaveBeenCalled();
    expect(report['additional-card-elements']).toEqual({
      settings: {
        boardProperty: {
          propertyKey: ADDITIONAL_CARD_ELEMENTS_BOARD_PROPERTY_KEY,
          state: 'initial',
          data: useAdditionalCardElementsBoardPropertyStore.getState().data,
        },
        localStorage: null,
      },
      runtime: null,
    });

    setStateSpy.mockRestore();
  });
});
