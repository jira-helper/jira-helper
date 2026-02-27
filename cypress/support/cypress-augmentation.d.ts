// Cypress Component Testing support file
import { mount } from 'cypress/react';

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      drag(sourceSelector: string, targetSelector: string): Chainable<void>;
      selectAntdOption(selector: string, optionLabel: string): Chainable<void>;
    }
  }
}
