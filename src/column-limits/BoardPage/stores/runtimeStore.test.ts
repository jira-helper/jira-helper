import { describe, it, expect, beforeEach } from 'vitest';
import { useColumnLimitsRuntimeStore, getInitialState } from './runtimeStore';
import type { GroupStats } from './runtimeStore.types';

describe('useColumnLimitsRuntimeStore', () => {
  beforeEach(() => {
    useColumnLimitsRuntimeStore.setState(getInitialState());
  });

  describe('initial state', () => {
    it('should have empty groupStats', () => {
      const state = useColumnLimitsRuntimeStore.getState();
      expect(state.data.groupStats).toEqual([]);
    });

    it('should have empty cssNotIssueSubTask', () => {
      const state = useColumnLimitsRuntimeStore.getState();
      expect(state.data.cssNotIssueSubTask).toBe('');
    });
  });

  describe('setGroupStats', () => {
    it('should update groupStats', () => {
      // Arrange
      const stats: GroupStats[] = [
        {
          groupId: 'group1',
          groupName: 'Group 1',
          columns: ['col1', 'col2'],
          currentCount: 5,
          limit: 10,
          isOverLimit: false,
          color: '#ff0000',
          ignoredSwimlanes: [],
        },
      ];

      // Act
      useColumnLimitsRuntimeStore.getState().actions.setGroupStats(stats);

      // Assert
      const state = useColumnLimitsRuntimeStore.getState();
      expect(state.data.groupStats).toEqual(stats);
      expect(state.data.groupStats).toHaveLength(1);
      expect(state.data.groupStats[0].groupId).toBe('group1');
    });

    it('should replace existing groupStats', () => {
      // Arrange
      const initialStats: GroupStats[] = [
        {
          groupId: 'group1',
          groupName: 'Group 1',
          columns: ['col1'],
          currentCount: 3,
          limit: 5,
          isOverLimit: false,
          color: '#ff0000',
          ignoredSwimlanes: [],
        },
      ];
      useColumnLimitsRuntimeStore.getState().actions.setGroupStats(initialStats);

      const newStats: GroupStats[] = [
        {
          groupId: 'group2',
          groupName: 'Group 2',
          columns: ['col2'],
          currentCount: 7,
          limit: 10,
          isOverLimit: false,
          color: '#00ff00',
          ignoredSwimlanes: [],
        },
      ];

      // Act
      useColumnLimitsRuntimeStore.getState().actions.setGroupStats(newStats);

      // Assert
      const state = useColumnLimitsRuntimeStore.getState();
      expect(state.data.groupStats).toEqual(newStats);
      expect(state.data.groupStats).toHaveLength(1);
      expect(state.data.groupStats[0].groupId).toBe('group2');
    });
  });

  describe('setCssNotIssueSubTask', () => {
    it('should update cssNotIssueSubTask', () => {
      // Arrange
      const css = '.ghx-subtask';

      // Act
      useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask(css);

      // Assert
      const state = useColumnLimitsRuntimeStore.getState();
      expect(state.data.cssNotIssueSubTask).toBe(css);
    });

    it('should replace existing cssNotIssueSubTask', () => {
      // Arrange
      useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('.old-selector');
      const newCss = '.new-selector';

      // Act
      useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask(newCss);

      // Assert
      const state = useColumnLimitsRuntimeStore.getState();
      expect(state.data.cssNotIssueSubTask).toBe(newCss);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      // Arrange
      const stats: GroupStats[] = [
        {
          groupId: 'group1',
          groupName: 'Group 1',
          columns: ['col1'],
          currentCount: 5,
          limit: 10,
          isOverLimit: false,
          color: '#ff0000',
          ignoredSwimlanes: [],
        },
      ];
      useColumnLimitsRuntimeStore.getState().actions.setGroupStats(stats);
      useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('.ghx-subtask');

      // Act
      useColumnLimitsRuntimeStore.getState().actions.reset();

      // Assert
      const state = useColumnLimitsRuntimeStore.getState();
      expect(state.data.groupStats).toEqual([]);
      expect(state.data.cssNotIssueSubTask).toBe('');
    });

    it('should reset multiple times without issues', () => {
      // Arrange & Act
      useColumnLimitsRuntimeStore.getState().actions.setGroupStats([
        {
          groupId: 'group1',
          groupName: 'Group 1',
          columns: ['col1'],
          currentCount: 5,
          limit: 10,
          isOverLimit: false,
          color: '#ff0000',
          ignoredSwimlanes: [],
        },
      ]);
      useColumnLimitsRuntimeStore.getState().actions.reset();
      useColumnLimitsRuntimeStore.getState().actions.reset();

      // Assert
      const state = useColumnLimitsRuntimeStore.getState();
      expect(state.data.groupStats).toEqual([]);
      expect(state.data.cssNotIssueSubTask).toBe('');
    });
  });
});
