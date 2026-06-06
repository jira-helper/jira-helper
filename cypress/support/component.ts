// Cypress Component Testing support file
import { mount } from 'cypress/react';
import 'cypress-mochawesome-reporter/register';
import './commands';

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);
