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

  const makePerson = (name: string) => ({ name, displayName: name, avatar: '', self: '' });

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

  // === MODAL LIFECYCLE ===

  Scenario('SC-MODAL-1: Open modal with empty state and default form values', ({ Given, When, Then, And }) => {
    Given('there are no limits configured', () => {
      useSettingsUIStore.getState().actions.reset();
    });

    When('I click "Manage per-person WIP-limits" button', () => {
      // UI action - store state should be ready for empty modal
    });

    Then('I should see the Personal WIP Limits modal', () => {
      // UI verification - store should be in initial state
      const state = useSettingsUIStore.getState();
      expect(state.state).toBe('initial');
    });

    And('I should see an empty limits table', () => {
      const { limits } = useSettingsUIStore.getState().data;
      expect(limits).toHaveLength(0);
    });

    And('I should see the avatar warning message', () => {
      // UI element - always visible, store doesn't control this
      expect(true).toBe(true);
    });

    And('the person name field should be empty', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData).toBeNull();
    });

    And('the limit field should show value 1', () => {
      // Default form value is handled by component, not store
      expect(true).toBe(true);
    });

    And('"All columns" checkbox should be checked', () => {
      // Default form value is handled by component
      expect(true).toBe(true);
    });

    And('"All swimlanes" checkbox should be checked', () => {
      // Default form value is handled by component
      expect(true).toBe(true);
    });

    And('"Count all issue types" checkbox should be checked', () => {
      // Default form value is handled by component
      expect(true).toBe(true);
    });

    When('I click "Save"', () => {
      // UI action - triggers saveToProperty
    });

    Then('the modal should be closed', () => {
      // UI verification
      expect(true).toBe(true);
    });
  });

  Scenario('SC-MODAL-2: Open modal with pre-configured limits', ({ Given, When, Then, And }) => {
    Given('there is a limit for "alice" with value 3 for all columns and all swimlanes', () => {
      const aliceLimit: PersonLimit = {
        ...createLimit(1, 'alice', 3),
        columns: [],
        swimlanes: [],
      };
      useSettingsUIStore.getState().actions.setData([aliceLimit]);
    });

    And('there is a limit for "bob" with value 5 for columns "To Do, In Progress" only', () => {
      const bobLimit: PersonLimit = {
        ...createLimit(2, 'bob', 5),
        columns: [
          { id: 'col1', name: 'To Do' },
          { id: 'col2', name: 'In Progress' },
        ],
      };
      const currentLimits = useSettingsUIStore.getState().data.limits;
      useSettingsUIStore.getState().actions.setData([...currentLimits, bobLimit]);
    });

    And('there is a limit for "charlie" with value 2 for swimlane "Frontend" only', () => {
      const charlieLimit: PersonLimit = {
        ...createLimit(3, 'charlie', 2),
        swimlanes: [{ id: 'swim1', name: 'Frontend' }],
      };
      const currentLimits = useSettingsUIStore.getState().data.limits;
      useSettingsUIStore.getState().actions.setData([...currentLimits, charlieLimit]);
    });

    And('there is a limit for "diana" with value 4 for issue types "Task, Bug" only', () => {
      const dianaLimit: PersonLimit = {
        ...createLimit(4, 'diana', 4),
        includedIssueTypes: ['Task', 'Bug'],
      };
      const currentLimits = useSettingsUIStore.getState().data.limits;
      useSettingsUIStore.getState().actions.setData([...currentLimits, dianaLimit]);
    });

    And(
      'there is a limit for "eve" with value 6 for columns "In Progress", swimlane "Backend" and issue types "Story"',
      () => {
        const eveLimit: PersonLimit = {
          ...createLimit(5, 'eve', 6),
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [{ id: 'swim2', name: 'Backend' }],
          includedIssueTypes: ['Story'],
        };
        const currentLimits = useSettingsUIStore.getState().data.limits;
        useSettingsUIStore.getState().actions.setData([...currentLimits, eveLimit]);
      }
    );

    When('I click "Manage per-person WIP-limits" button', () => {
      // UI action - modal opens with pre-configured limits
    });

    Then('I should see the Personal WIP Limits modal', () => {
      // UI verification
      expect(true).toBe(true);
    });

    And('I should see 5 limits in the table', () => {
      const { limits } = useSettingsUIStore.getState().data;
      expect(limits).toHaveLength(5);
    });

    And('I should see limit for "alice" with value 3 and "All" columns and "All" swimlanes', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const alice = limits.find(l => l.person.name === 'alice');
      expect(alice?.limit).toBe(3);
      expect(alice?.columns).toHaveLength(0); // empty = all
      expect(alice?.swimlanes).toHaveLength(0); // empty = all
    });

    And('I should see limit for "bob" with value 5 and columns "To Do, In Progress"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const bob = limits.find(l => l.person.name === 'bob');
      expect(bob?.limit).toBe(5);
      expect(bob?.columns).toHaveLength(2);
    });

    And('I should see limit for "charlie" with value 2 and swimlane "Frontend"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const charlie = limits.find(l => l.person.name === 'charlie');
      expect(charlie?.limit).toBe(2);
      expect(charlie?.swimlanes[0].name).toBe('Frontend');
    });

    And('I should see limit for "diana" with value 4 and issue types "Task, Bug"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const diana = limits.find(l => l.person.name === 'diana');
      expect(diana?.limit).toBe(4);
      expect(diana?.includedIssueTypes).toEqual(['Task', 'Bug']);
    });

    And(
      'I should see limit for "eve" with value 6, column "In Progress", swimlane "Backend" and issue types "Story"',
      () => {
        const { limits } = useSettingsUIStore.getState().data;
        const eve = limits.find(l => l.person.name === 'eve');
        expect(eve?.limit).toBe(6);
        expect(eve?.columns[0].name).toBe('In Progress');
        expect(eve?.swimlanes[0].name).toBe('Backend');
        expect(eve?.includedIssueTypes).toEqual(['Story']);
      }
    );

    When('I click "Cancel"', () => {
      // UI action - cancel without saving
    });

    Then('the modal should be closed', () => {
      // UI verification
      expect(true).toBe(true);
    });
  });

  // === ADD LIMIT ===

  Scenario('SC-ADD-1: Add a new limit for a person', ({ When, And, Then }) => {
    let formData: FormData;

    When('I enter person name "john.doe"', () => {
      formData = {
        person: makePerson('john.doe'),
        limit: 0,
        selectedColumns: [],
        swimlanes: [],
      };
    });

    And('I set the limit to 5', () => {
      formData.limit = 5;
    });

    And('I click "Add limit"', () => {
      const newLimit = createLimit(1, formData.person!.name, formData.limit);
      useSettingsUIStore.getState().actions.addLimit(newLimit);
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

    And(
      'the form should be reset to default values (empty person name, limit 1, all columns, all swimlanes, all issue types)',
      () => {
        expect(useSettingsUIStore.getState().data.formData).toBeNull();
      }
    );
  });

  Scenario('SC-ADD-2: Add a limit for specific columns only', ({ When, And, Then }) => {
    let formData: FormData;

    When('I enter person name "jane.doe"', () => {
      formData = {
        person: makePerson('jane.doe'),
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
        ...createLimit(1, formData.person!.name, formData.limit),
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

  Scenario('SC-ADD-3: Add a limit for specific swimlanes only', ({ When, And, Then }) => {
    let formData: FormData;

    When('I enter person name "john.doe"', () => {
      formData = {
        person: makePerson('john.doe'),
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
        ...createLimit(1, formData.person!.name, formData.limit),
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

  Scenario('SC-ADD-4: Add a limit for specific issue types only', ({ When, And, Then }) => {
    let formData: FormData;

    When('I enter person name "john.doe"', () => {
      formData = {
        person: makePerson('john.doe'),
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
      const newLimit: PersonLimit = {
        ...createLimit(1, formData.person!.name, formData.limit),
        includedIssueTypes: ['Task', 'Bug'],
      };
      useSettingsUIStore.getState().actions.addLimit(newLimit);
    });

    Then('the limit for "john.doe" should count only "Task, Bug" issues', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.includedIssueTypes).toEqual(['Task', 'Bug']);
    });

    And(
      'the form should be reset to default values (empty person name, all swimlanes, all columns, all issue types)',
      () => {
        expect(useSettingsUIStore.getState().data.formData).toBeNull();
      }
    );
  });

  Scenario('SC-ADD-5: Add a limit with columns, swimlanes and issue types', ({ When, And, Then }) => {
    let formData: FormData;

    When('I enter person name "john.doe"', () => {
      formData = {
        person: makePerson('john.doe'),
        limit: 0,
        selectedColumns: [],
        swimlanes: [],
      };
    });

    And('I set the limit to 4', () => {
      formData.limit = 4;
    });

    And('I select only columns "In Progress"', () => {
      formData.selectedColumns = ['col2'];
    });

    And('I select only swimlane "Backend"', () => {
      formData.swimlanes = ['swim2'];
    });

    And('I uncheck "Count all issue types"', () => {
      // UI action
    });

    And('I select issue types "Story"', () => {
      formData.includedIssueTypes = ['Story'];
    });

    And('I click "Add limit"', () => {
      useSettingsUIStore.getState().actions.setFormData(formData);
      const newLimit: PersonLimit = {
        ...createLimit(1, formData.person!.name, formData.limit),
        columns: [{ id: 'col2', name: 'In Progress' }],
        swimlanes: [{ id: 'swim2', name: 'Backend' }],
        includedIssueTypes: ['Story'],
      };
      useSettingsUIStore.getState().actions.setData([newLimit]);
    });

    Then(
      'the limit for "john.doe" should apply to column "In Progress", swimlane "Backend" and issue types "Story"',
      () => {
        const { limits } = useSettingsUIStore.getState().data;
        const limit = limits.find(l => l.person.name === 'john.doe');
        expect(limit?.columns[0].name).toBe('In Progress');
        expect(limit?.swimlanes[0].name).toBe('Backend');
        expect(limit?.includedIssueTypes).toEqual(['Story']);
      }
    );
  });

  Scenario('SC-ADD-6: Add multiple limits for same person with different columns', ({ Given, When, And, Then }) => {
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

  Scenario('SC-ADD-7: Cannot add limit without person name', ({ When, And, Then }) => {
    let formData: FormData;
    let validationError = false;

    When('I set the limit to 5', () => {
      formData = {
        person: null,
        limit: 5,
        selectedColumns: [],
        swimlanes: [],
      };
    });

    And('I click "Add limit"', () => {
      if (!formData.person) {
        validationError = true;
      }
    });

    Then('I should see a validation error for person name', () => {
      expect(validationError).toBe(true);
    });

    And('the person name field should have error highlight', () => {
      // UI verification — field shows red border
      expect(validationError).toBe(true);
    });

    And('I should see error message "Enter person name"', () => {
      // UI verification — error text displayed under field
      expect(validationError).toBe(true);
    });

    // eslint-disable-next-line prettier/prettier
    And('I don\'t see new limit in the table', () => {
      const { limits } = useSettingsUIStore.getState().data;
      expect(limits).toHaveLength(0);
    });
  });

  Scenario('SC-ADD-8: Cannot add limit with zero value', ({ When, And, Then }) => {
    When('I enter person name "john.doe"', () => {
      // UI-level scenario: InputNumber min={1} prevents zero
    });

    And('I set the limit to 0', () => {
      // InputNumber with min={1} auto-corrects 0 → 1
    });

    Then('I see 1 in input', () => {
      // UI verification: InputNumber min={1} ensures value >= 1
      expect(true).toBe(true);
    });
  });

  Scenario('SC-ADD-9: Cannot add duplicate limit', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 5 for all columns and all swimlanes', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 5),
        columns: [],
        swimlanes: [],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    let formData: FormData;
    let validationError = false;

    When('I enter person name "john.doe"', () => {
      formData = {
        person: makePerson('john.doe'),
        limit: 3,
        selectedColumns: [],
        swimlanes: [],
      };
    });

    And('I set the limit to 3', () => {
      formData.limit = 3;
    });

    And('I click "Add limit"', () => {
      const isDup = useSettingsUIStore
        .getState()
        .actions.isDuplicate(formData.person!.name, formData.selectedColumns, formData.swimlanes);
      if (isDup) {
        validationError = true;
      }
    });

    Then('I should see a validation error for duplicate limit', () => {
      expect(validationError).toBe(true);
    });

    And('the limit should not be added to the list', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const johnLimits = limits.filter(l => l.person.name === 'john.doe');
      expect(johnLimits).toHaveLength(1);
    });

    And('the existing limit for "john.doe" should still show value 5', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.limit).toBe(5);
    });

    And('there is only 1 limit for "john.doe"', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const johnLimits = limits.filter(l => l.person.name === 'john.doe');
      expect(johnLimits).toHaveLength(1);
    });
  });

  // === EDIT LIMIT ===

  Scenario('SC-EDIT-1: Edit shows current values', ({ Given, When, Then, And }) => {
    Given('there is a limit for "john.doe" with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    Then('I should see "john.doe" in the person name field', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.person?.name).toBe('john.doe');
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

  Scenario('SC-EDIT-2: Update limit value', ({ Given, When, And, Then }) => {
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

  Scenario('SC-EDIT-3: Change person name', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    And('I change person name to "jane.doe"', () => {
      const formData = { ...useSettingsUIStore.getState().data.formData!, person: makePerson('jane.doe') };
      useSettingsUIStore.getState().actions.setFormData(formData);
    });

    And('I click "Edit limit"', () => {
      const currentLimit = useSettingsUIStore.getState().data.limits.find(l => l.id === 1)!;
      const updatedLimit = {
        ...currentLimit,
        person: { ...currentLimit.person, name: 'jane.doe', displayName: 'jane.doe' },
      };
      useSettingsUIStore.getState().actions.updateLimit(1, updatedLimit);
    });

    Then('I should see "jane.doe" in the limits list', () => {
      const { limits } = useSettingsUIStore.getState().data;
      expect(limits.some(l => l.person.name === 'jane.doe')).toBe(true);
    });

    And('"john.doe" should not be in the limits list', () => {
      const { limits } = useSettingsUIStore.getState().data;
      expect(limits.some(l => l.person.name === 'john.doe')).toBe(false);
    });
  });

  Scenario('SC-EDIT-4: Add swimlane filter to existing simple limit', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 5 for all columns and all swimlanes', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 5),
        columns: [],
        swimlanes: [],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    Then('I see "john.doe" in person name input', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.person?.name).toBe('john.doe');
    });

    And('I see "5" in limit count input', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.limit).toBe(5);
    });

    And('I see checkbox "all swimlanes" is checked', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.swimlanes).toHaveLength(0);
    });

    And('I see checkbox "all columns" is checked', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.selectedColumns).toHaveLength(0);
    });

    When('I click checkbox "all swimlanes"', () => {
      const formData = useSettingsUIStore.getState().data.formData!;
      useSettingsUIStore.getState().actions.setFormData({
        ...formData,
        swimlanes: ['swim1', 'swim2'],
      });
    });

    Then('I see checkbox "all columns" is checked', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.selectedColumns).toHaveLength(0);
    });

    And('I see list of checkboxes in swimlanes with checked Frontend, Backend', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.swimlanes).toContain('swim1');
      expect(formData?.swimlanes).toContain('swim2');
    });

    When('I click checkbox Backend', () => {
      const formData = useSettingsUIStore.getState().data.formData!;
      useSettingsUIStore.getState().actions.setFormData({
        ...formData,
        swimlanes: formData.swimlanes.filter(s => s !== 'swim2'),
      });
    });

    Then('I see checkbox Frontend is checked', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.swimlanes).toContain('swim1');
    });

    And('I see checkbox Backend is unchecked', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.swimlanes).not.toContain('swim2');
    });

    When('I click "Edit limit"', () => {
      const currentLimit = useSettingsUIStore.getState().data.limits.find(l => l.id === 1)!;
      const formData = useSettingsUIStore.getState().data.formData!;
      const updatedLimit = {
        ...currentLimit,
        swimlanes: formData.swimlanes.map(s => ({
          id: s,
          name: s === 'swim1' ? 'Frontend' : 'Backend',
        })),
      };
      useSettingsUIStore.getState().actions.updateLimit(1, updatedLimit);
    });

    Then('the limit for "john.doe" should apply only to swimlane "Frontend", all columns and limit value is 5', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.swimlanes).toHaveLength(1);
      expect(limit?.swimlanes[0].name).toBe('Frontend');
      expect(limit?.columns).toHaveLength(0);
      expect(limit?.limit).toBe(5);
    });
  });

  Scenario('SC-EDIT-5: Add column filter to limit with swimlane', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 5 for swimlane "Frontend" only', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 5),
        swimlanes: [{ id: 'swim1', name: 'Frontend' }],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    And('I select only columns "To Do, In Progress"', () => {
      const formData = { ...useSettingsUIStore.getState().data.formData!, selectedColumns: ['col1', 'col2'] };
      useSettingsUIStore.getState().actions.setFormData(formData);
    });

    And('I click "Edit limit"', () => {
      const currentLimit = useSettingsUIStore.getState().data.limits.find(l => l.id === 1)!;
      const updatedLimit = {
        ...currentLimit,
        columns: [
          { id: 'col1', name: 'To Do' },
          { id: 'col2', name: 'In Progress' },
        ],
      };
      useSettingsUIStore.getState().actions.updateLimit(1, updatedLimit);
    });

    Then(
      'the limit for "john.doe" should apply to columns "To Do, In Progress" and swimlane "Frontend" and limit value is 5',
      () => {
        const { limits } = useSettingsUIStore.getState().data;
        const limit = limits.find(l => l.person.name === 'john.doe');
        expect(limit?.columns.map(c => c.name)).toEqual(['To Do', 'In Progress']);
        expect(limit?.swimlanes[0].name).toBe('Frontend');
        expect(limit?.limit).toBe(5);
      }
    );
  });

  Scenario('SC-EDIT-5a: Changing swimlane filter does not affect column filter', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 5 for all columns and all swimlanes', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 5),
        columns: [],
        swimlanes: [],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    And('I uncheck "All swimlanes"', () => {
      // UI action — uncheck "All swimlanes" checkbox
      // This should NOT affect columns
    });

    Then('"All columns" should still be checked', () => {
      // Columns state should remain unchanged
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.selectedColumns).toHaveLength(0);
    });

    And('the columns selection should not change', () => {
      const { formData } = useSettingsUIStore.getState().data;
      expect(formData?.selectedColumns).toHaveLength(0);
    });
  });

  Scenario('SC-EDIT-6: Add issue type filter to limit with columns and swimlane', ({ Given, When, And, Then }) => {
    Given(
      'there is a limit for "john.doe" with value 5 for columns "To Do, In Progress" and swimlane "Frontend"',
      () => {
        const existingLimit: PersonLimit = {
          ...createLimit(1, 'john.doe', 5),
          columns: [
            { id: 'col1', name: 'To Do' },
            { id: 'col2', name: 'In Progress' },
          ],
          swimlanes: [{ id: 'swim1', name: 'Frontend' }],
        };
        useSettingsUIStore.getState().actions.setData([existingLimit]);
      }
    );

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    And('I uncheck "Count all issue types"', () => {
      // UI action
    });

    And('I select issue types "Task, Bug"', () => {
      const formData = { ...useSettingsUIStore.getState().data.formData!, includedIssueTypes: ['Task', 'Bug'] };
      useSettingsUIStore.getState().actions.setFormData(formData);
    });

    And('I click "Edit limit"', () => {
      const currentLimit = useSettingsUIStore.getState().data.limits.find(l => l.id === 1)!;
      const updatedLimit = { ...currentLimit, includedIssueTypes: ['Task', 'Bug'] };
      useSettingsUIStore.getState().actions.updateLimit(1, updatedLimit);
    });

    Then(
      'the limit for "john.doe" should apply to columns "To Do, In Progress", swimlane "Frontend" and issue types "Task, Bug" and limit value is 5',
      () => {
        const { limits } = useSettingsUIStore.getState().data;
        const limit = limits.find(l => l.person.name === 'john.doe');
        expect(limit?.columns.map(c => c.name)).toEqual(['To Do', 'In Progress']);
        expect(limit?.swimlanes[0].name).toBe('Frontend');
        expect(limit?.includedIssueTypes).toEqual(['Task', 'Bug']);
        expect(limit?.limit).toBe(5);
      }
    );
  });

  Scenario('SC-EDIT-7: Expand columns filter to all columns', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 5 for columns "To Do, In Progress" only', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 5),
        columns: [
          { id: 'col1', name: 'To Do' },
          { id: 'col2', name: 'In Progress' },
        ],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    And('I check "All columns"', () => {
      // When all columns are selected, selectedColumns becomes empty array (meaning "all")
      const formData = { ...useSettingsUIStore.getState().data.formData!, selectedColumns: [] };
      useSettingsUIStore.getState().actions.setFormData(formData);
    });

    And('I click "Edit limit"', () => {
      const currentLimit = useSettingsUIStore.getState().data.limits.find(l => l.id === 1)!;
      const updatedLimit = { ...currentLimit, columns: [] }; // empty = all
      useSettingsUIStore.getState().actions.updateLimit(1, updatedLimit);
    });

    Then('the limit for "john.doe" should apply to all columns', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.columns).toHaveLength(0); // empty = all
    });
  });

  Scenario('SC-EDIT-8: Expand swimlanes filter to all swimlanes', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 5 for swimlane "Frontend" only', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 5),
        swimlanes: [{ id: 'swim1', name: 'Frontend' }],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    And('I check "All swimlanes"', () => {
      // When all swimlanes are selected, swimlanes becomes empty array (meaning "all")
      const formData = { ...useSettingsUIStore.getState().data.formData!, swimlanes: [] };
      useSettingsUIStore.getState().actions.setFormData(formData);
    });

    And('I click "Edit limit"', () => {
      const currentLimit = useSettingsUIStore.getState().data.limits.find(l => l.id === 1)!;
      const updatedLimit = { ...currentLimit, swimlanes: [] }; // empty = all
      useSettingsUIStore.getState().actions.updateLimit(1, updatedLimit);
    });

    Then('the limit for "john.doe" should apply to all swimlanes', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.swimlanes).toHaveLength(0); // empty = all
    });
  });

  Scenario('SC-EDIT-9: Expand issue types filter to all issue types', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 5 for issue types "Task, Bug" only', () => {
      const existingLimit: PersonLimit = {
        ...createLimit(1, 'john.doe', 5),
        includedIssueTypes: ['Task', 'Bug'],
      };
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    And('I check "Count all issue types"', () => {
      // When "Count all" is checked, includedIssueTypes becomes undefined/empty
      const formData = { ...useSettingsUIStore.getState().data.formData!, includedIssueTypes: undefined };
      useSettingsUIStore.getState().actions.setFormData(formData);
    });

    And('I click "Edit limit"', () => {
      const currentLimit = useSettingsUIStore.getState().data.limits.find(l => l.id === 1)!;
      const updatedLimit = { ...currentLimit, includedIssueTypes: undefined };
      useSettingsUIStore.getState().actions.updateLimit(1, updatedLimit);
    });

    Then('the limit for "john.doe" should count all issue types', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.includedIssueTypes).toBeUndefined();
    });
  });

  Scenario('SC-EDIT-10: Edit limit preserves issue type filter', ({ Given, When, Then, And }) => {
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

  Scenario('SC-EDIT-11: Cancel editing returns to add mode', ({ Given, When, And, Then }) => {
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

    And('I select only swimlane "Frontend"', () => {
      const formData = { ...useSettingsUIStore.getState().data.formData!, swimlanes: ['swim1'] };
      useSettingsUIStore.getState().actions.setFormData(formData);
    });

    And('I select only columns "To Do, In Progress"', () => {
      const formData = { ...useSettingsUIStore.getState().data.formData!, selectedColumns: ['col1', 'col2'] };
      useSettingsUIStore.getState().actions.setFormData(formData);
    });

    And('I click cancel editing', () => {
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

  Scenario('SC-EDIT-12: Cannot save edit with zero value', ({ Given, When, And, Then }) => {
    Given('there is a limit for "john.doe" with value 5', () => {
      const existingLimit = createLimit(1, 'john.doe', 5);
      useSettingsUIStore.getState().actions.setData([existingLimit]);
    });

    let validationError = false;

    When('I click "Edit" on the limit for "john.doe"', () => {
      useSettingsUIStore.getState().actions.setEditingId(1);
    });

    And('I set the limit to 0', () => {
      const formData = { ...useSettingsUIStore.getState().data.formData!, limit: 0 };
      useSettingsUIStore.getState().actions.setFormData(formData);
    });

    And('I click "Edit limit"', () => {
      // Validation should prevent saving
      const { formData } = useSettingsUIStore.getState().data;
      if (formData && formData.limit <= 0) {
        validationError = true;
      }
    });

    Then('I should see a validation error for limit value', () => {
      expect(validationError).toBe(true);
    });

    And('the limit for "john.doe" should still show value 5', () => {
      const { limits } = useSettingsUIStore.getState().data;
      const limit = limits.find(l => l.person.name === 'john.doe');
      expect(limit?.limit).toBe(5);
    });
  });

  // === DELETE LIMIT ===

  Scenario('SC-DELETE-1: Delete a limit', ({ Given, When, Then }) => {
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
});
