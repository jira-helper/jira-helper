/// <reference types="cypress" />
/// <reference types="sinon" />

/**
 * @module wiplimit-on-cells/SettingsPage/features/helpers
 *
 * Test helpers for WIP Limit on Cells SettingsPage BDD tests.
 * Provides fixtures, setup functions, and mount helpers.
 */
import React from 'react';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { SettingsButtonContainer } from '../components/SettingsButton';
import { useWipLimitCellsSettingsUIStore } from '../stores/settingsUIStore';
import type { WipLimitRange } from '../../types';

// --- Test fixtures matching feature Background ---

export const columns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Review' },
  { id: 'col4', name: 'Done' },
];

export const swimlanes = [
  { id: 'sw1', name: 'Frontend' },
  { id: 'sw2', name: 'Backend' },
  { id: 'sw3', name: 'QA' },
];

export const createRange = (
  name: string,
  wipLimit: number = 0,
  cells: Array<{ swimlane: string; column: string; showBadge: boolean }> = [],
  disable: boolean = false
): WipLimitRange => ({
  name,
  wipLimit,
  cells,
  disable,
});

let onSaveToProperty: Cypress.Agent<sinon.SinonStub>;

export const setupBackground = () => {
  globalContainer.reset();
  registerLogger(globalContainer);
  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });

  useWipLimitCellsSettingsUIStore.setState(useWipLimitCellsSettingsUIStore.getInitialState());
  const saveStub = cy.stub().resolves();
  cy.wrap(saveStub).as('onSaveToProperty');
  onSaveToProperty = saveStub as Cypress.Agent<sinon.SinonStub>;
};

export const mountComponent = (initialRanges: WipLimitRange[] = []) => {
  cy.mount(
    <WithDi container={globalContainer}>
      <SettingsButtonContainer
        swimlanes={swimlanes}
        columns={columns}
        initialRanges={initialRanges}
        onSaveToProperty={onSaveToProperty}
      />
    </WithDi>
  );
};

export const getOnSaveToProperty = () => onSaveToProperty;
