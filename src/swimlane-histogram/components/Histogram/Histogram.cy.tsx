/// <reference types="cypress" />
import React from 'react';
import { Histogram } from './Histogram';
import type { SwimlaneHistogram } from '../../types';

const normalData: SwimlaneHistogram = {
  swimlaneId: 'swim-1',
  totalIssues: 15,
  columns: [
    { columnName: 'To Do', issueCount: 5 },
    { columnName: 'In Progress', issueCount: 8 },
    { columnName: 'Review', issueCount: 2 },
    { columnName: 'Done', issueCount: 0 },
  ],
};

const emptyData: SwimlaneHistogram = {
  swimlaneId: 'swim-1',
  totalIssues: 0,
  columns: [
    { columnName: 'To Do', issueCount: 0 },
    { columnName: 'In Progress', issueCount: 0 },
    { columnName: 'Done', issueCount: 0 },
  ],
};

describe('Histogram', () => {
  it('should render histogram with data-testid', () => {
    cy.mount(<Histogram data={normalData} />);

    cy.get('[data-testid="histogram"]').should('exist');
  });

  it('should render columns with data-testid histogram-column-N', () => {
    cy.mount(<Histogram data={normalData} />);

    cy.get('[data-testid="histogram-column-0"]').should('exist');
    cy.get('[data-testid="histogram-column-1"]').should('exist');
    cy.get('[data-testid="histogram-column-2"]').should('exist');
    cy.get('[data-testid="histogram-column-3"]').should('exist');
  });

  it('should display bars proportionally to total issues', () => {
    cy.mount(<Histogram data={normalData} />);

    // totalIssues = 15, In Progress = 8: height = (20 * 8) / 15 ≈ 10.67px
    cy.get('[data-testid="histogram-column-1"]')
      .find('[class*="bar"]')
      .invoke('css', 'height')
      .then(height => {
        const numericHeight = parseFloat(String(height));
        expect(numericHeight).to.be.closeTo(10.67, 0.1);
      });
  });

  it('should show empty columns with light gray background (#eee)', () => {
    cy.mount(<Histogram data={emptyData} />);

    cy.get('[data-testid="histogram-column-0"]')
      .should('have.css', 'backgroundColor')
      .and('match', /rgb\(238,\s*238,\s*238\)|#eee/i);
  });

  it('should show filled columns with dark gray background (#999)', () => {
    cy.mount(<Histogram data={normalData} />);

    cy.get('[data-testid="histogram-column-0"]')
      .should('have.css', 'backgroundColor')
      .and('match', /rgb\(153,\s*153,\s*153\)|#999/i);
  });

  it('should show tooltip with "Column: N" on hover', () => {
    cy.mount(<Histogram data={normalData} />);

    cy.get('[data-testid="histogram-column-0"]').trigger('mouseover');
    cy.get('body').contains('To Do: 5').should('be.visible');
  });
});
