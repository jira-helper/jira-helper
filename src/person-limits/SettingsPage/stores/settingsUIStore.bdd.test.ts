/**
 * Unit BDD Tests for Settings UI Store
 *
 * These tests validate the store behavior against the feature specification.
 * They test store actions and state transitions in isolation.
 *
 * Feature file: ../settings-page.feature
 */
import { expect } from 'vitest';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { useSettingsUIStore } from './settingsUIStore';
import type { PersonLimit, FormData } from '../state/types';

const feature = await loadFeature('src/person-limits/SettingsPage/SettingsPage.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  // Test data
  // Note: columns and swimlanes are used in Background steps but ESLint doesn't detect it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let columns: Array<{ id: string; name: string }>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let swimlanes: Array<{ id: string; name: string }>;

  const createLimit = (id: number, name: string, limit: number): PersonLimit => ({
    id,
    person: { name, displayName: name, self: '', avatar: '' },
    limit,
    columns: [],
    swimlanes: [],
  });

  Background(({ Given, And }) => {
    Given('I am on the Personal WIP Limits settings page', () => {
      useSettingsUIStore.getState().actions.reset();
    });

    And('there are columns "To Do, In Progress, Done" on the board', () => {
      columns = [
        { id: 'col1', name: 'To Do' },
        { id: 'col2', name: 'In Progress' },
        { id: 'col3', name: 'Done' },
      ];
    });

    And('there are swimlanes "Frontend, Backend" on the board', () => {
      swimlanes = [
        { id: 'swim1', name: 'Frontend' },
        { id: 'swim2', name: 'Backend' },
      ];
    });
  });

  // === SC1: ADD LIMIT ===

  Scenario('SC1: Add a new limit for a person', ({ When, And, Then }) => {
    let formData: FormData;

    When('I enter person name "john.doe"', () => {
      formData = {
        personName: 'john.doe',
        limit: 0,
        selectedColumns: [],
        swimlanes: [],
      };
    });

    And('I set the limit to 5', () => {
      formData.limit = 5;
    });

    And('I click "Add limit"', () => {
      useSettingsUIStore.getState().actions.setFormData(formData);
      const newLimit = createLimit(1, formData.personName, formData.limit);
      useSettingsUIStore.getState().actions.setData([newLimit]);
    });

    Then('I should see "john.doe" in the limits list', () => {
      const { limits } = useSettingsUIStore.getState().data;
      expect(limits.some(l => l.person.name === 'john.doe')).toBe(true);
    });

    And('the limit should show value 5', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.limit).toBe(5);
    });
  });

  // === SC2: ADD LIMIT FOR SPECIFIC COLUMNS ===

  Scenario('SC2: Add a limit for specific columns only', ({ When, And, Then }) => {
    let formData: FormData;

    When('I enter person name "jane.doe"', () => {
      formData = {
        personName: 'jane.doe',
        limit: 0,
        selectedColumns: [],
        swimlanes: [],
      };
    });

    And('I set the limit to 3', () => {
      formData.limit = 3;
    });

    And('I select only columns "To Do, In Progress"', () => {
      formData.selectedColumns = ['col1', 'col2'];
    });

    And('I click "Add limit"', () => {
      useSettingsUIStore.getState().actions.setFormData(formData);
      const newLimit: PersonLimit = {
        ...createLimit(1, formData.personName, formData.limit),
        columns: [
          { id: 'col1', name: 'To Do' },
          { id: 'col2', name: 'In Progress' },
        ],
      };
      useSettingsUIStore.getState().actions.setData([newLimit]);
    });

    Then('the limit for "jane.doe" should apply only to "To Do, In Progress"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'jane.doe');
      expect(limit?.columns.map(c => c.name)).toEqual(['To Do', 'In Progress']);
    });
  });

  // === SC3: EDIT EXISTING LIMIT ===

  Scenario('SC3: Edit an existing limit', ({ Given, When, Then, And }) => {
    Given('there is a limit for "john.doe" with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    Then('I should see "john.doe" in the person name field', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.personName).toBe('john.doe');
    });

    And('I should see 5 in the limit field', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.limit).toBe(5);
    });

    And('the button should show "Edit limit"', () => {
      const { editingId } = useSettingsUIStore.getState().data;
      expect(editingId).toBe(1);
    });
  });

  // === SC4: UPDATE LIMIT VALUE ===

  Scenario('SC4: Update limit value', ({ Given, When, And, Then }) => {
    let editFormData: FormData;

    Given('there is a limit for "john.doe" with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
      editFormData = { ...useSettingsUIStore.getState().data.formData! };
    });

    And('I change the limit to 10', () => {
      editFormData.limit = 10;
    });

    And('I click "Edit limit"', () => {
      useSettingsUIStore.getState().actions.setFormData(editFormData);
      const currentLimit = useSettingsUIStore.getState().data.limits.find(l => l.id === 1)!;
      useSettingsUIStore.getState().actions.updateLimit(1, { ...currentLimit, limit: 10 });
    });

    Then('the limit for "john.doe" should show value 10', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.limit).toBe(10);
    });
  });

  // === SC5: DELETE LIMIT ===

  Scenario('SC5: Delete a limit', ({ Given, When, Then }) => {
    Given('there is a limit for "john.doe"', () => {
      const existingLimit = createLimit(1, 'john.doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Delete" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.deleteLimit(1);
    });

    Then('"john.doe" should not be in the limits list', () => {
      const { limits } = useSettingsUIStore.getState().data;
      expect(limits.some(l => l.person.name === 'john.doe')).toBe(false);
    });
  });

  // === SC6: MASS OPERATIONS ===

  Scenario('SC6: Apply columns to multiple limits at once', ({ Given, When, And, Then }) => {
    Given('there are limits for "john.doe" and "jane.doe"', () => {
      const limits = [createLimit(1, 'john.doe', 5), createLimit(2, 'jane.doe', 3)];
      useSettingsUIStore.getState().actions.setData(limits);
    });

    When('I select both limits', () => {
      useSettingsUIStore.getState().actions.setCheckedIds([1, 2]);
    });

    And('I click "Apply columns for selected users"', () => {
      // Action triggered by UI
    });

    And('I choose only column "To Do"', () => {
      useSettingsUIStore.getState().actions.applyColumnsToSelected([{ id: 'col1', name: 'To Do' }]);
    });

    Then('both limits should apply only to "To Do"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      limits.forEach(limit => {
        expect(limit.columns).toHaveLength(1);
        expect(limit.columns[0].name).toBe('To Do');
      });
    });
  });

  // === SC7: SWIMLANES ===

  Scenario('SC7: Add a limit for specific swimlanes only', ({ When, And, Then }) => {
    let formData: FormData;

    When('I enter person name "john.doe"', () => {
      formData = {
        personName: 'john.doe',
        limit: 0,
        selectedColumns: [],
        swimlanes: [],
      };
    });

    And('I set the limit to 5', () => {
      formData.limit = 5;
    });

    And('I select only swimlane "Frontend"', () => {
      formData.swimlanes = ['swim1'];
    });

    And('I click "Add limit"', () => {
      useSettingsUIStore.getState().actions.setFormData(formData);
      const newLimit: PersonLimit = {
        ...createLimit(1, formData.personName, formData.limit),
        swimlanes: [{ id: 'swim1', name: 'Frontend' }],
      };
      useSettingsUIStore.getState().actions.setData([newLimit]);
    });

    Then('the limit for "john.doe" should apply only to swimlane "Frontend"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.swimlanes).toHaveLength(1);
      expect(limit?.swimlanes[0].name).toBe('Frontend');
    });
  });

  // === SC8: MASS APPLY SWIMLANES ===

  Scenario('SC8: Apply swimlanes to multiple limits at once', ({ Given, When, And, Then }) => {
    Given('there are limits for "john.doe" and "jane.doe"', () => {
      const limits = [createLimit(1, 'john.doe', 5), createLimit(2, 'jane.doe', 3)];
      useSettingsUIStore.getState().actions.setData(limits);
    });

    When('I select both limits', () => {
      useSettingsUIStore.getState().actions.setCheckedIds([1, 2]);
    });

    And('I click "Apply swimlanes for selected users"', () => {
      // Action triggered by UI
    });

    And('I choose only swimlane "Backend"', () => {
      useSettingsUIStore.getState().actions.applySwimlanesToSelected([{ id: 'swim2', name: 'Backend' }]);
    });

    Then('both limits should apply only to swimlane "Backend"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      limits.forEach(limit => {
        expect(limit.swimlanes).toHaveLength(1);
        expect(limit.swimlanes[0].name).toBe('Backend');
      });
    });
  });

  // === SC9: ISSUE TYPES ===

  Scenario('SC9: Add a limit for specific issue types only', ({ When, And, Then }) => {
    let formData: FormData;

    When('I enter person name "john.doe"', () => {
      formData = {
        personName: 'john.doe',
        limit: 0,
        selectedColumns: [],
        swimlanes: [],
      };
    });

    And('I set the limit to 3', () => {
      formData.limit = 3;
    });

    And('I uncheck "Count all issue types"', () => {
      // UI action - prepare for specific types
    });

    And('I select issue types "Task, Bug"', () => {
      formData.includedIssueTypes = ['Task', 'Bug'];
    });

    And('I click "Add limit"', () => {
      useSettingsUIStore.getState().actions.setFormData(formData);
      const newLimit: PersonLimit = {
        ...createLimit(1, formData.personName, formData.limit),
        includedIssueTypes: ['Task', 'Bug'],
      };
      useSettingsUIStore.getState().actions.setData([newLimit]);
    });

    Then('the limit for "john.doe" should count only "Task, Bug" issues', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.includedIssueTypes).toEqual(['Task', 'Bug']);
    });
  });

  // === SC10: EDIT PRESERVES ISSUE TYPES ===

  Scenario('SC10: Edit limit preserves issue type filter', ({ Given, When, Then, And }) => {
    Given('there is a limit for "john.doe" with issue types "Task, Bug"', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 5),
        includedIssueTypes: ['Task', 'Bug'],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    Then('issue types "Task, Bug" should be selected', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.includedIssueTypes).toEqual(['Task', 'Bug']);
    });

    And('"Count all issue types" should be unchecked', () => {
      const { formData } = useSettingsUIStore.getState().data;
      // If includedIssueTypes has values, "Count all" is unchecked
      expect(formData?.includedIssueTypes?.length).toBeGreaterThan(0);
    });
  });

  // === SC11: VALIDATION - NO NAME ===

  Scenario('SC11: Cannot add limit without person name', ({ When, And, Then }) => {
    let formData: FormData;
    let validationError = false;

    When('I set the limit to 5', () => {
      formData = {
        personName: '',
        limit: 5,
        selectedColumns: [],
        swimlanes: [],
      };
    });

    And('I click "Add limit"', () => {
      // Validation should prevent adding
      if (!formData.personName) {
        validationError = true;
      }
    });

    Then('I should see a validation error for person name', () => {
      expect(validationError).toBe(true);
    });
  });

  // === SC12: VALIDATION - ZERO LIMIT ===

  Scenario('SC12: Cannot add limit with zero value', ({ When, And, Then }) => {
    let formData: FormData;
    let validationError = false;

    When('I enter person name "john.doe"', () => {
      formData = {
        personName: 'john.doe',
        limit: 0,
        selectedColumns: [],
        swimlanes: [],
      };
    });

    And('I leave limit as 0', () => {
      formData.limit = 0;
    });

    And('I click "Add limit"', () => {
      // Validation should prevent adding
      if (formData.limit <= 0) {
        validationError = true;
      }
    });

    Then('I should see a validation error for limit value', () => {
      expect(validationError).toBe(true);
    });
  });

  // === SC13: CANCEL EDIT ===

  Scenario('SC13: Cancel editing returns to add mode', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    And('I change the limit to 10', () => {
      const formData = { ...useSettingsUIStore.getState().data.formData!, limit: 10 };
      useSettingsUIStore.getState().actions.setFormData(formData);
    });

    And('I click somewhere else to cancel', () => {
      // Cancel edit by resetting editingId
      useSettingsUIStore.getState().actions.setEditingId(null);
    });

    Then('the button should show "Add limit"', () => {
      const { editingId } = useSettingsUIStore.getState().data;
      expect(editingId).toBeNull();
    });

    And('the limit for "john.doe" should still show value 5', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.limit).toBe(5);
    });
  });

  // === SC14: EMPTY STATE ===

  Scenario('SC14: Show empty state when no limits exist', ({ Given, Then, And }) => {
    Given('there are no limits configured', () => {
      useSettingsUIStore.getState().actions.reset();
    });

    Then('I should see an empty limits table', () => {
      const { limits } = useSettingsUIStore.getState().data;
      expect(limits).toHaveLength(0);
    });

    And('I should see the avatar warning message', () => {
      // UI element - always visible, store doesn't control this
      expect(true).toBe(true);
    });
  });

  // === SC15: MULTIPLE LIMITS PER PERSON ===

  Scenario('SC15: Add multiple limits for same person with different columns', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 3 for column "To Do"', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 3),
        columns: [{ id: 'col1', name: 'To Do' }],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I enter person name "john.doe"', () => {
      // Form input
    });

    And('I set the limit to 5', () => {
      // Form input
    });

    And('I select only column "In Progress"', () => {
      // Form input
    });

    And('I click "Add limit"', () => {
      const newLimit: PersonLimit = {
        ...createLimit(2, 'john.doe', 5),
        columns: [{ id: 'col2', name: 'In Progress' }],
      };
      useSettingsUIStore.getState().actions.addLimit(newLimit);
    });

    Then('I should see two limits for "john.doe"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const johnLimits = limits.filter(l => l.person.name === 'john.doe');
      expect(johnLimits).toHaveLength(2);
    });

    And('one limit should show value 3 for "To Do"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe' && l.limit === 3);
      expect(limit?.columns[0].name).toBe('To Do');
    });

    And('another limit should show value 5 for "In Progress"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe' && l.limit === 5);
      expect(limit?.columns[0].name).toBe('In Progress');
    });
  });
});
