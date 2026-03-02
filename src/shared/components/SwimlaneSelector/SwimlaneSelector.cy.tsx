/// <reference types="cypress" />
import React, { useState, useCallback, useMemo } from 'react';
import { Card } from 'antd';
import { SwimlaneSelector, Swimlane } from './SwimlaneSelector';

const manySwimlanesFixture: Swimlane[] = Array.from({ length: 20 }, (_, i) => ({
  id: `sw-${i + 1}`,
  name: `Swimlane ${i + 1}`,
}));

const ControlledSwimlaneSelector: React.FC<{ swimlanes: Swimlane[]; initialValue?: string[] }> = ({
  swimlanes,
  initialValue = [],
}) => {
  const [value, setValue] = useState<string[]>(initialValue);
  return <SwimlaneSelector swimlanes={swimlanes} value={value} onChange={setValue} />;
};

/**
 * Simulates real usage pattern in ColumnLimitsForm where:
 * - Parent re-renders when swimlanes selection changes
 * - SwimlaneSelector is inside a Card inside a parent component
 */
const ParentWithRerender: React.FC<{ swimlanes: Swimlane[]; initialValue?: string[] }> = ({
  swimlanes,
  initialValue = [],
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialValue);
  const [renderCount, setRenderCount] = useState(0);

  const handleChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    setRenderCount(c => c + 1);
  }, []);

  const selectedSwimlanes = useMemo(
    () => (selectedIds.length === 0 ? [] : swimlanes.filter(s => selectedIds.includes(s.id))),
    [selectedIds, swimlanes]
  );

  return (
    <Card title={`Group (renders: ${renderCount})`}>
      <div>Selected: {selectedSwimlanes.length === 0 ? 'All' : selectedSwimlanes.map(s => s.name).join(', ')}</div>
      <SwimlaneSelector swimlanes={swimlanes} value={selectedIds} onChange={handleChange} />
    </Card>
  );
};

describe('SwimlaneSelector', () => {
  describe('Scroll Position Preservation', () => {
    it('should preserve scroll position when selecting an item at the bottom of the list', () => {
      // Mount with expanded list (partial selection)
      cy.mount(<ControlledSwimlaneSelector swimlanes={manySwimlanesFixture} initialValue={['sw-1']} />);

      // Verify list is visible
      cy.get('[data-testid="swimlane-list"]').should('be.visible');

      // Scroll to bottom of the list
      cy.get('[data-testid="swimlane-list"]').scrollTo('bottom');

      // Get scroll position before click
      cy.get('[data-testid="swimlane-list"]').then($list => {
        const scrollTopBefore = $list[0].scrollTop;
        expect(scrollTopBefore).to.be.greaterThan(0);

        // Click on the last swimlane checkbox
        cy.contains('label', 'Swimlane 20').click();

        // Verify scroll position is preserved (with small tolerance for rendering)
        cy.get('[data-testid="swimlane-list"]').should($listAfter => {
          const scrollTopAfter = $listAfter[0].scrollTop;
          expect(scrollTopAfter).to.be.closeTo(scrollTopBefore, 10);
        });
      });
    });

    it('should preserve scroll position when deselecting an item at the bottom of the list', () => {
      // Mount with all items except last selected
      const allExceptLast = manySwimlanesFixture.slice(0, -1).map(s => s.id);
      cy.mount(<ControlledSwimlaneSelector swimlanes={manySwimlanesFixture} initialValue={allExceptLast} />);

      // Verify list is visible
      cy.get('[data-testid="swimlane-list"]').should('be.visible');

      // Scroll to bottom
      cy.get('[data-testid="swimlane-list"]').scrollTo('bottom');

      // Get scroll position before click
      cy.get('[data-testid="swimlane-list"]').then($list => {
        const scrollTopBefore = $list[0].scrollTop;
        expect(scrollTopBefore).to.be.greaterThan(0);

        // Deselect Swimlane 19 (which is selected)
        cy.contains('label', 'Swimlane 19').click();

        // Verify scroll position is preserved
        cy.get('[data-testid="swimlane-list"]').should($listAfter => {
          const scrollTopAfter = $listAfter[0].scrollTop;
          expect(scrollTopAfter).to.be.closeTo(scrollTopBefore, 10);
        });
      });
    });

    it('should preserve scroll position when parent component re-renders', () => {
      // This test simulates real ColumnLimitsForm usage where parent re-renders on change
      cy.mount(<ParentWithRerender swimlanes={manySwimlanesFixture} initialValue={['sw-1', 'sw-2', 'sw-3']} />);

      // Verify list is visible
      cy.get('[data-testid="swimlane-list"]').should('be.visible');

      // Scroll to bottom
      cy.get('[data-testid="swimlane-list"]').scrollTo('bottom');

      // Get scroll position before click
      cy.get('[data-testid="swimlane-list"]').then($list => {
        const scrollTopBefore = $list[0].scrollTop;
        expect(scrollTopBefore).to.be.greaterThan(0);

        // Click on Swimlane 20 to select it (this will trigger parent re-render)
        cy.contains('label', 'Swimlane 20').click();

        // Verify parent re-rendered
        cy.contains('renders: 1').should('exist');

        // Verify scroll position is preserved after parent re-render
        cy.get('[data-testid="swimlane-list"]').should($listAfter => {
          const scrollTopAfter = $listAfter[0].scrollTop;
          expect(scrollTopAfter).to.be.closeTo(scrollTopBefore, 10);
        });
      });
    });
  });
});
