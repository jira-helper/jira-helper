import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Container } from 'dioma';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { useSubTaskProgressBoardPropertyStore } from './SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import {
  SUB_TASK_PROGRESS_BOARD_PROPERTY_KEY,
  collectSubTasksProgressDiagnosticData,
  registerSubTasksProgressDiagnosticData,
} from './diagnosticRegistration';

describe('sub-tasks-progress diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({ token: loggerToken, value: new Logger() });
    useSubTaskProgressBoardPropertyStore.setState(useSubTaskProgressBoardPropertyStore.getInitialState());
    localStorage.clear();
    diagnosticModule.ensure(container);
    registerSubTasksProgressDiagnosticData(container);
  });

  it('registers sub-tasks-progress diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('sub-tasks-progress');
  });

  it('returns §5.3 payload with board property snapshot and user guide localStorage', () => {
    const boardData = {
      ...useSubTaskProgressBoardPropertyStore.getState().data,
      enabled: false,
      columnsToTrack: ['To Do'],
    };
    useSubTaskProgressBoardPropertyStore.getState().actions.setData(boardData);
    useSubTaskProgressBoardPropertyStore.getState().actions.setState('loaded');
    localStorage.setItem('jira-helper-user-guide-viewed', 'true');
    localStorage.setItem('jira-helper-user-guide-view-count', '3');

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    const result = collectSubTasksProgressDiagnosticData();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const payload = result.val;
    expect(payload).toEqual({
      settings: {
        boardProperty: {
          propertyKey: SUB_TASK_PROGRESS_BOARD_PROPERTY_KEY,
          state: 'loaded',
          data: boardData,
        },
        localStorage: {
          userGuideViewed: 'true',
          userGuideViewCount: '3',
        },
      },
      runtime: null,
    });
    expect(getItemSpy).toHaveBeenCalledWith('jira-helper-user-guide-viewed');
    expect(getItemSpy).toHaveBeenCalledWith('jira-helper-user-guide-view-count');
    expect(() => JSON.stringify(payload)).not.toThrow();

    getItemSpy.mockRestore();
  });

  it('collects via DiagnosticModel without loading board property', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);
    const setStateSpy = vi.spyOn(useSubTaskProgressBoardPropertyStore.getState().actions, 'setState');

    const report = diagnosticModel.collectDiagnosticReport();

    expect(setStateSpy).not.toHaveBeenCalled();
    expect(report['sub-tasks-progress']).toEqual({
      settings: {
        boardProperty: {
          propertyKey: SUB_TASK_PROGRESS_BOARD_PROPERTY_KEY,
          state: 'initial',
          data: useSubTaskProgressBoardPropertyStore.getState().data,
        },
        localStorage: {
          userGuideViewed: null,
          userGuideViewCount: null,
        },
      },
      runtime: null,
    });

    setStateSpy.mockRestore();
  });
});
