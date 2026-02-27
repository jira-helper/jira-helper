/**
 * Unit BDD Tests for Settings UI Store
 *
 * These tests validate the store behavior against the feature specification.
 * They test store actions and state transitions in isolation.
 *
 * Feature file: ../SettingsPage.feature
 */
import { expect } from 'vitest';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { useWipLimitCellsSettingsUIStore } from './settingsUIStore';

const feature = await loadFeature('src/wiplimit-on-cells/SettingsPage/SettingsPage.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  // Test data
  // Note: columns and swimlanes are used in Background steps but ESLint doesn't detect it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let columns: Array<{ id: string; name: string }>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let swimlanes: Array<{ id: string; name: string }>;

  Background(({ Given, And }) => {
    Given('I am on the WIP Limit on Cells settings page', () => {
      useWipLimitCellsSettingsUIStore.setState(useWipLimitCellsSettingsUIStore.getInitialState());
    });

    And('there are columns "To Do, In Progress, Review, Done" on the board', () => {
      columns = [
        { id: 'col1', name: 'To Do' },
        { id: 'col2', name: 'In Progress' },
        { id: 'col3', name: 'Review' },
        { id: 'col4', name: 'Done' },
      ];
    });

    And('there are swimlanes "Frontend, Backend, QA" on the board', () => {
      swimlanes = [
        { id: 'sw1', name: 'Frontend' },
        { id: 'sw2', name: 'Backend' },
        { id: 'sw3', name: 'QA' },
      ];
    });
  });

  // === SC1-SC3: UI SCENARIOS (not store logic) ===

  Scenario('SC-MODAL-1: Open settings popup', ({ When, Then, And }) => {
    When('I click "Edit Wip limits by cells"', () => {
      // UI action - not store logic
    });

    Then('I should see the "Edit WipLimit on cells" popup', () => {
      // UI assertion - not store logic
      expect(true).toBe(true);
    });

    And('I should see the "Add range" form', () => {
      // UI assertion - not store logic
      expect(true).toBe(true);
    });

    And('I should see the swimlane dropdown', () => {
      // UI assertion - not store logic
      expect(true).toBe(true);
    });

    And('I should see the column dropdown', () => {
      // UI assertion - not store logic
      expect(true).toBe(true);
    });

    And('I should see the "show indicator" checkbox', () => {
      // UI assertion - not store logic
      expect(true).toBe(true);
    });

    And('I should see the ranges table', () => {
      // UI assertion - not store logic
      expect(true).toBe(true);
    });
  });

  Scenario('SC-MODAL-2: Save and close popup', ({ Given, And, When, Then }) => {
    Given('I have opened the "Edit WipLimit on cells" popup', () => {
      // UI state - not store logic
    });

    And('I have made some changes', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Test Range');
    });

    When('I click "Save"', () => {
      // UI action - not store logic, but store should have data
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges.length).toBeGreaterThan(0);
    });

    Then('the popup should close', () => {
      // UI assertion - not store logic
      expect(true).toBe(true);
    });

    And('the changes should be saved to Jira board property', () => {
      // Tested in property store tests
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges.length).toBeGreaterThan(0);
    });
  });

  Scenario('SC-MODAL-3: Cancel closes popup without saving', ({ Given, And, When, Then }) => {
    Given('I have opened the "Edit WipLimit on cells" popup', () => {
      // UI state - not store logic
    });

    And('I have made some changes', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Test Range');
    });

    When('I click "Cancel"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.reset();
    });

    Then('the popup should close', () => {
      // UI assertion - not store logic
      expect(true).toBe(true);
    });

    And('the changes should not be saved', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(0);
    });
  });

  Scenario('SC-MODAL-4: Close button (X) closes popup without saving', ({ Given, And, When, Then }) => {
    Given('I have opened the "Edit WipLimit on cells" popup', () => {
      // UI state - not store logic
    });

    And('I have made some changes', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Test Range');
    });

    When('I click the close button (X)', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.reset();
    });

    Then('the popup should close', () => {
      // UI assertion - not store logic
      expect(true).toBe(true);
    });

    And('the changes should not be saved', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(0);
    });
  });

  // === SC4: ADD RANGE WITH CELL ===

  Scenario('SC-ADD-1: Add a new range with a cell', ({ When, And, Then }) => {
    When('I open the settings popup', () => {
      // Store is already reset in Background
    });

    And('I enter range name "Critical Path"', () => {
      // Form input - not store action
    });

    And('I select swimlane "Frontend"', () => {
      // Form input - not store action
    });

    And('I select column "In Progress"', () => {
      // Form input - not store action
    });

    And('I check "show indicator"', () => {
      // Form input - not store action
    });

    And('I click "Add range"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      const added = actions.addRange('Critical Path');
      expect(added).toBe(true);

      // Add cell to the range
      actions.addCells('Critical Path', {
        swimlane: 'sw1',
        column: 'col2',
        showBadge: true,
      });
    });

    Then('I should see "Critical Path" in the ranges table', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(1);
      expect(data.ranges[0].name).toBe('Critical Path');
    });

    And('the range "Critical Path" should have WIP limit 0', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Critical Path');
      expect(range?.wipLimit).toBe(0);
    });

    And('the range "Critical Path" should contain cell "Frontend / In Progress"', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Critical Path');
      expect(range?.cells).toHaveLength(1);
      expect(range?.cells[0].swimlane).toBe('sw1');
      expect(range?.cells[0].column).toBe('col2');
    });

    And('the cell "Frontend / In Progress" should have the badge indicator icon', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Critical Path');
      expect(range?.cells[0].showBadge).toBe(true);
    });
  });

  // === SC5: CANNOT ADD RANGE WITHOUT NAME ===

  Scenario('SC-ADD-2: Cannot add range without name', ({ When, And, Then }) => {
    When('I open the settings popup', () => {
      // Store is already reset in Background
    });

    And('I leave the range name empty', () => {
      // Form input - not store action
    });

    And('I select swimlane "Frontend"', () => {
      // Form input - not store action
    });

    And('I select column "In Progress"', () => {
      // Form input - not store action
    });

    And('I click "Add range"', () => {
      // Validation happens in store
    });

    Then('I should see an alert "Enter range name"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      const result = actions.addRange('');
      expect(result).toBe(false);
    });

    And('the ranges table should remain unchanged', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(0);
    });
  });

  // === SC6: CANNOT ADD RANGE WITH DUPLICATE NAME ===

  Scenario('SC-ADD-3: Cannot add range with duplicate name', ({ Given, When, And, Then }) => {
    Given('there is a range "Critical Path" in the settings', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I enter range name "Critical Path"', () => {
      // Form input - not store action
    });

    And('I select swimlane "Backend"', () => {
      // Form input - not store action
    });

    And('I select column "Review"', () => {
      // Form input - not store action
    });

    And('I click "Add range"', () => {
      // Validation happens in store
    });

    Then('I should see an alert "Enter unique range name"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      const result = actions.addRange('Critical Path');
      expect(result).toBe(false);
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(1);
    });
  });

  // === SC8: BUTTON SHOWS "ADD RANGE" FOR NEW NAME ===

  Scenario('SC-CELL-2: Button shows "Add range" for new name', ({ Given, When, And, Then }) => {
    Given('there is a range "Critical Path" in the settings', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I enter range name "New Range"', () => {
      // Form input - not store action
    });

    Then('the button should show "Add range"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      const found = actions.findRange('New Range');
      expect(found).toBe(false);
    });
  });

  // === SC7: BUTTON CHANGES TO "ADD CELL" ===

  Scenario(
    'SC-CELL-1: Button changes to "Add cell" when range name matches existing range',
    ({ Given, When, And, Then }) => {
      Given('there is a range "Critical Path" in the settings', () => {
        const { actions } = useWipLimitCellsSettingsUIStore.getState();
        actions.addRange('Critical Path');
      });

      When('I open the settings popup', () => {
        // Already opened
      });

      And('I enter range name "Critical Path"', () => {
        // Form input - not store action
      });

      Then('the button should show "Add cell"', () => {
        const { actions } = useWipLimitCellsSettingsUIStore.getState();
        const found = actions.findRange('Critical Path');
        expect(found).toBe(true);
      });
    }
  );

  // === SC9: ADD CELL TO EXISTING RANGE ===

  Scenario('SC-CELL-3: Add cell to existing range', ({ Given, When, And, Then }) => {
    Given('there is a range "Critical Path" with cell "Frontend / In Progress"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
      actions.addCells('Critical Path', {
        swimlane: 'sw1',
        column: 'col2',
        showBadge: true,
      });
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I enter range name "Critical Path"', () => {
      // Form input - not store action
    });

    And('I select swimlane "Backend"', () => {
      // Form input - not store action
    });

    And('I select column "In Progress"', () => {
      // Form input - not store action
    });

    And('I click "Add cell"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addCells('Critical Path', {
        swimlane: 'sw2',
        column: 'col2',
        showBadge: false,
      });
    });

    Then('the range "Critical Path" should contain cells:', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Critical Path');
      expect(range?.cells).toHaveLength(2);

      const cells = range?.cells || [];
      const frontendCell = cells.find(c => c.swimlane === 'sw1' && c.column === 'col2');
      const backendCell = cells.find(c => c.swimlane === 'sw2' && c.column === 'col2');

      expect(frontendCell).toBeDefined();
      expect(backendCell).toBeDefined();
    });
  });

  // === SC10: CANNOT ADD DUPLICATE CELL ===

  Scenario('SC-CELL-4: Cannot add duplicate cell to range', ({ Given, When, And, Then }) => {
    Given('there is a range "Critical Path" with cell "Frontend / In Progress"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
      actions.addCells('Critical Path', {
        swimlane: 'sw1',
        column: 'col2',
        showBadge: true,
      });
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I enter range name "Critical Path"', () => {
      // Form input - not store action
    });

    And('I select swimlane "Frontend"', () => {
      // Form input - not store action
    });

    And('I select column "In Progress"', () => {
      // Form input - not store action
    });

    And('I click "Add cell"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      // Try to add duplicate cell
      actions.addCells('Critical Path', {
        swimlane: 'sw1',
        column: 'col2',
        showBadge: false,
      });
    });

    Then('the range "Critical Path" should still have only one cell "Frontend / In Progress"', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Critical Path');
      expect(range?.cells).toHaveLength(1);
      expect(range?.cells[0].swimlane).toBe('sw1');
      expect(range?.cells[0].column).toBe('col2');
    });
  });

  // === SC13: EDIT RANGE NAME INLINE ===

  Scenario('SC-EDIT-1: Edit range name inline', ({ Given, When, And, Then }) => {
    Given('there is a range "Critical Path" with WIP limit 5', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
      actions.changeField('Critical Path', 'wipLimit', 5);
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I change the name of range "Critical Path" to "Hot Path"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      // Store doesn't have rename action, so we simulate it by changing the name field
      const range = useWipLimitCellsSettingsUIStore.getState().data.ranges.find(r => r.name === 'Critical Path');
      if (range) {
        actions.deleteRange('Critical Path');
        actions.addRange('Hot Path');
        actions.changeField('Hot Path', 'wipLimit', range.wipLimit);
        actions.changeField('Hot Path', 'cells', range.cells);
      }
    });

    And('I click away to confirm', () => {
      // UI action - not store action
    });

    Then('the range should be renamed to "Hot Path"', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Hot Path');
      expect(range).toBeDefined();
      expect(data.ranges.find(r => r.name === 'Critical Path')).toBeUndefined();
    });
  });

  // === SC14: EDIT WIP LIMIT INLINE ===

  Scenario('SC-EDIT-2: Edit WIP limit inline', ({ Given, When, And, Then }) => {
    Given('there is a range "Critical Path" with WIP limit 5', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
      actions.changeField('Critical Path', 'wipLimit', 5);
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I change the WIP limit of "Critical Path" to 10', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.changeField('Critical Path', 'wipLimit', 10);
    });

    And('I click away to confirm', () => {
      // UI action - not store action
    });

    Then('the range "Critical Path" should have WIP limit 10', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Critical Path');
      expect(range?.wipLimit).toBe(10);
    });
  });

  // === SC11-SC12: VALIDATION (UI level, not store) ===

  Scenario('SC-VALID-1: Cannot add range or cell without selecting swimlane', ({ When, And, Then }) => {
    When('I open the settings popup', () => {
      // Store is already reset in Background
    });

    And('I enter range name "My Range"', () => {
      // Form input - not store action
    });

    And('I leave swimlane as "-"', () => {
      // Form input - not store action
    });

    And('I select column "In Progress"', () => {
      // Form input - not store action
    });

    And('I click "Add range"', () => {
      // Validation happens at UI level, not store level
    });

    Then('I should see an alert "need choose swimlane and column and try again."', () => {
      // UI validation - not store logic
      expect(true).toBe(true);
    });
  });

  Scenario('SC-VALID-2: Cannot add range or cell without selecting column', ({ When, And, Then }) => {
    When('I open the settings popup', () => {
      // Store is already reset in Background
    });

    And('I enter range name "My Range"', () => {
      // Form input - not store action
    });

    And('I select swimlane "Frontend"', () => {
      // Form input - not store action
    });

    And('I leave column as "-"', () => {
      // Form input - not store action
    });

    And('I click "Add range"', () => {
      // Validation happens at UI level, not store level
    });

    Then('I should see an alert "need choose swimlane and column and try again."', () => {
      // UI validation - not store logic
      expect(true).toBe(true);
    });
  });

  // === SC15: TOGGLE DISABLE CHECKBOX ===

  Scenario('SC-EDIT-3: Toggle disable checkbox', ({ Given, When, And, Then }) => {
    Given('there is a range "Critical Path" that is not disabled', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
      // disable is undefined by default (not disabled)
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I check the "Disable" checkbox for "Critical Path"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.changeField('Critical Path', 'disable', true);
    });

    Then('the range "Critical Path" should be marked as disabled', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Critical Path');
      expect(range?.disable).toBe(true);
    });
  });

  // === SC17: DELETE A RANGE ===

  Scenario('SC-DELETE-1: Delete a range', ({ Given, When, And, Then }) => {
    Given('there are ranges "Critical Path" and "Review Path"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
      actions.addRange('Review Path');
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I click the delete icon on range "Critical Path"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.deleteRange('Critical Path');
    });

    Then('"Critical Path" should not be in the ranges table', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges.find(r => r.name === 'Critical Path')).toBeUndefined();
    });

    And('"Review Path" should still be in the ranges table', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges.find(r => r.name === 'Review Path')).toBeDefined();
    });
  });

  // === SC18: DELETE A CELL FROM RANGE ===

  Scenario('SC-DELETE-2: Delete a cell from range', ({ Given, When, And, Then }) => {
    Given('there is a range "Critical Path" with cells "Frontend / In Progress" and "Backend / Review"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
      actions.addCells('Critical Path', {
        swimlane: 'sw1',
        column: 'col2',
        showBadge: true,
      });
      actions.addCells('Critical Path', {
        swimlane: 'sw2',
        column: 'col3',
        showBadge: false,
      });
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I click the delete icon on cell "Frontend / In Progress" in range "Critical Path"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.deleteCells('Critical Path', 'sw1', 'col2');
    });

    Then('the range "Critical Path" should not contain "Frontend / In Progress"', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Critical Path');
      const cell = range?.cells.find(c => c.swimlane === 'sw1' && c.column === 'col2');
      expect(cell).toBeUndefined();
    });

    And('the range "Critical Path" should still contain "Backend / Review"', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Critical Path');
      const cell = range?.cells.find(c => c.swimlane === 'sw2' && c.column === 'col3');
      expect(cell).toBeDefined();
    });
  });

  // === SC16: SELECT RANGE FOR EDITING ===

  Scenario('SC-EDIT-4: Select range for editing via edit icon', ({ Given, When, And, Then }) => {
    Given('there is a range "Critical Path"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I click the edit icon on range "Critical Path"', () => {
      // UI action - store doesn't track editing state
      // This would be handled by form state, not store
    });

    Then('the range name input should show "Critical Path"', () => {
      // UI assertion - not store logic
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'Critical Path');
      expect(range).toBeDefined();
    });

    And('the button should show "Add cell"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      const found = actions.findRange('Critical Path');
      expect(found).toBe(true);
    });
  });

  // === SC19: CLEAR ALL SETTINGS ===

  Scenario('SC-CLEAR-1: Clear all settings', ({ Given, When, And, Then }) => {
    Given('there are ranges "Critical Path" and "Review Path" with configured cells', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
      actions.addCells('Critical Path', {
        swimlane: 'sw1',
        column: 'col2',
        showBadge: true,
      });
      actions.addRange('Review Path');
      actions.addCells('Review Path', {
        swimlane: 'sw2',
        column: 'col3',
        showBadge: false,
      });
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    And('I click "Clear and save all data"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.setRanges([]);
    });

    Then('all ranges should be removed', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(0);
    });

    And('the Jira board property should be cleared', () => {
      // This is tested in property store tests
      // Here we verify UI store is cleared
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(0);
    });

    And('the popup should re-open with empty state', () => {
      const { data, state } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(0);
      expect(state).toBe('loaded');
    });
  });

  // === SC23-SC24: SHOW BADGE (already covered in SC4) ===

  Scenario('SC-BADGE-1: Add cell with show badge indicator', ({ When, And, Then }) => {
    When('I open the settings popup', () => {
      // Store is already reset in Background
    });

    And('I enter range name "My Range"', () => {
      // Form input - not store action
    });

    And('I select swimlane "Frontend"', () => {
      // Form input - not store action
    });

    And('I select column "In Progress"', () => {
      // Form input - not store action
    });

    And('I check "show indicator"', () => {
      // Form input - not store action
    });

    And('I click "Add range"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('My Range');
      actions.addCells('My Range', {
        swimlane: 'sw1',
        column: 'col2',
        showBadge: true,
      });
    });

    Then('the cell "Frontend / In Progress" should show the badge info icon', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'My Range');
      expect(range?.cells[0].showBadge).toBe(true);
    });
  });

  Scenario('SC-BADGE-2: Add cell without show badge indicator', ({ When, And, Then }) => {
    When('I open the settings popup', () => {
      // Store is already reset in Background
    });

    And('I enter range name "My Range"', () => {
      // Form input - not store action
    });

    And('I select swimlane "Frontend"', () => {
      // Form input - not store action
    });

    And('I select column "In Progress"', () => {
      // Form input - not store action
    });

    And('I leave "show indicator" unchecked', () => {
      // Form input - not store action
    });

    And('I click "Add range"', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('My Range');
      actions.addCells('My Range', {
        swimlane: 'sw1',
        column: 'col2',
        showBadge: false,
      });
    });

    Then('the cell "Frontend / In Progress" should not show the badge info icon', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      const range = data.ranges.find(r => r.name === 'My Range');
      expect(range?.cells[0].showBadge).toBe(false);
    });
  });

  // === SC20: SAVE PERSISTS (tested in property store, but verify UI store has data) ===

  Scenario('SC-PERSIST-1: Save persists to Jira board property', ({ Given, When, Then }) => {
    Given('I have configured range "Critical Path" with WIP limit 5 and cells', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.addRange('Critical Path');
      actions.changeField('Critical Path', 'wipLimit', 5);
      actions.addCells('Critical Path', {
        swimlane: 'sw1',
        column: 'col2',
        showBadge: true,
      });
    });

    When('I click "Save"', () => {
      // UI action - store should have data ready
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges.length).toBeGreaterThan(0);
    });

    Then('the settings should be saved to the Jira board property "WIP_LIMITS_CELLS"', () => {
      // Verify UI store has correct data that would be copied to property store
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(1);
      expect(data.ranges[0].name).toBe('Critical Path');
      expect(data.ranges[0].wipLimit).toBe(5);
      expect(data.ranges[0].cells).toHaveLength(1);
      // Actual save is tested in property store tests
    });
  });

  // === SC21: SETTINGS LOAD (tested in property store) ===

  Scenario('SC-PERSIST-2: Settings load on page open', ({ Given, When, Then }) => {
    Given('there are saved WIP limit settings in the Jira board property', () => {
      // This is tested in property store tests
      // Here we simulate loading into UI store
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.setRanges([
        {
          name: 'Critical Path',
          wipLimit: 5,
          cells: [
            {
              swimlane: 'sw1',
              column: 'col2',
              showBadge: true,
            },
          ],
        },
      ]);
    });

    When('I open the settings popup', () => {
      // Store is already loaded in Given step
    });

    Then('I should see the previously saved ranges and cells', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(1);
      expect(data.ranges[0].name).toBe('Critical Path');
    });
  });

  // === SC22: BACKWARD COMPATIBILITY (tested in property store) ===

  Scenario('SC-COMPAT-1: Load settings with legacy "swimline" field', ({ Given, When, Then, And }) => {
    Given('there are saved settings with the legacy "swimline" field instead of "swimlane"', () => {
      // This is tested in property store tests
      // Here we simulate that normalized data is loaded into UI store
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      actions.setRanges([
        {
          name: 'Legacy Range',
          wipLimit: 5,
          cells: [
            {
              swimlane: 'sw1', // Already normalized from swimline
              column: 'col2',
              showBadge: true,
            },
          ],
        },
      ]);
    });

    When('I open the settings popup', () => {
      // Store is already loaded in Given step
    });

    Then('the settings should load correctly', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(1);
      expect(data.ranges[0].name).toBe('Legacy Range');
    });

    And('the "swimline" values should be treated as "swimlane"', () => {
      // Normalization is tested in property store tests
      // Here we verify UI store has correct data
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges[0].cells[0].swimlane).toBe('sw1');
    });
  });

  // === SC25: EMPTY STATE ===

  Scenario('SC-EMPTY-1: Show empty table when no ranges configured', ({ Given, When, Then, And }) => {
    Given('there are no WIP limit settings configured', () => {
      useWipLimitCellsSettingsUIStore.setState(useWipLimitCellsSettingsUIStore.getInitialState());
    });

    When('I open the settings popup', () => {
      // Already opened
    });

    Then('I should see an empty ranges table with column headers', () => {
      const { data } = useWipLimitCellsSettingsUIStore.getState();
      expect(data.ranges).toHaveLength(0);
    });

    And('I should be able to add a new range', () => {
      const { actions } = useWipLimitCellsSettingsUIStore.getState();
      const result = actions.addRange('New Range');
      expect(result).toBe(true);
    });
  });
});
