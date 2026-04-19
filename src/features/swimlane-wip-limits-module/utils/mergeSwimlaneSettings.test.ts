import { describe, it, expect } from 'vitest';
import { mergeSwimlaneSettings } from './mergeSwimlaneSettings';
import type { SwimlaneSettings } from '../types';

describe('mergeSwimlaneSettings', () => {
  it('should return empty object when both inputs are undefined', () => {
    // Act
    const result = mergeSwimlaneSettings(undefined, undefined);

    // Assert
    expect(result).toEqual({});
  });

  it('should migrate old settings without columns to include columns: []', () => {
    // Arrange - legacy format: { limit } without columns
    const oldSettings: SwimlaneSettings = {
      swim1: { limit: 5 } as any,
      swim2: { limit: 3, includedIssueTypes: ['Bug'] } as any,
    };

    // Act
    const result = mergeSwimlaneSettings(undefined, oldSettings);

    // Assert
    expect(result).toEqual({
      swim1: { limit: 5, columns: [] },
      swim2: { limit: 3, includedIssueTypes: ['Bug'], columns: [] },
    });
  });

  it('should preserve columns from new settings', () => {
    // Arrange
    const newSettings: SwimlaneSettings = {
      swim1: { limit: 5, columns: ['In Progress', 'Review'] },
    };

    // Act
    const result = mergeSwimlaneSettings(newSettings, undefined);

    // Assert
    expect(result).toEqual({
      swim1: { limit: 5, columns: ['In Progress', 'Review'] },
    });
  });

  it('should merge old and new - new overrides old for same swimlane', () => {
    // Arrange
    const oldSettings: SwimlaneSettings = {
      swim1: { limit: 3 } as any,
    };
    const newSettings: SwimlaneSettings = {
      swim1: { limit: 5, columns: ['In Progress'] },
    };

    // Act
    const result = mergeSwimlaneSettings(newSettings, oldSettings);

    // Assert - new overrides old
    expect(result.swim1).toEqual({ limit: 5, columns: ['In Progress'] });
  });

  it('should add columns: [] for old settings that have columns undefined', () => {
    // Arrange
    const oldSettings = {
      swim1: { limit: 5 },
    } as unknown as SwimlaneSettings;

    // Act
    const result = mergeSwimlaneSettings(undefined, oldSettings);

    // Assert
    expect(result.swim1.columns).toEqual([]);
  });
});
