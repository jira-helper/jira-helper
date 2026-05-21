import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';
import { useSubTaskProgressBoardPropertyStore } from './SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const SUB_TASK_PROGRESS_BOARD_PROPERTY_KEY = 'sub-task-progress';

const USER_GUIDE_STORAGE_KEYS = {
  viewed: 'jira-helper-user-guide-viewed',
  viewCount: 'jira-helper-user-guide-view-count',
} as const;

export function collectSubTasksProgressDiagnosticData(): Result<FeatureDiagnosticData, Error> {
  const { data, state } = useSubTaskProgressBoardPropertyStore.getState();

  return Ok({
    settings: {
      boardProperty: {
        propertyKey: SUB_TASK_PROGRESS_BOARD_PROPERTY_KEY,
        state,
        data,
      },
      localStorage: {
        userGuideViewed: localStorage.getItem(USER_GUIDE_STORAGE_KEYS.viewed),
        userGuideViewCount: localStorage.getItem(USER_GUIDE_STORAGE_KEYS.viewCount),
      },
    },
    runtime: null,
  } as unknown as FeatureDiagnosticData);
}

export function registerSubTasksProgressDiagnosticData(container: Container): void {
  const { model: diagnosticModel } = container.inject(diagnosticModelToken);

  diagnosticModel.registerDiagnosticData('sub-tasks-progress', collectSubTasksProgressDiagnosticData);
}
