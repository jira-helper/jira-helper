import { Then, When } from '../../../../../../cypress/support/bdd-runner';

When(/^I select the Gantt time interval "([^"]*)"$/, (interval: string) => {
  cy.get(`input[name="gantt-interval"][value="${interval}"]`).click({ force: true });
});

Then('the Gantt time axis should show day-formatted ticks', () => {
  cy.get('[data-testid="gantt-axis-label"]').should($labels => {
    expect($labels.length).to.be.at.least(1);
    $labels.each((_, el) => {
      expect(Cypress.$(el).text()).to.match(/^[A-Z][a-z]{2} \d{2}$/);
    });
  });
});

Then('the Gantt time axis should show hour-formatted ticks', () => {
  cy.get('[data-testid="gantt-axis-label"]').should($labels => {
    expect($labels.length).to.be.at.least(1);
    $labels.each((_, el) => {
      expect(Cypress.$(el).text()).to.match(/^\d{2}:\d{2}$/);
    });
  });
});
