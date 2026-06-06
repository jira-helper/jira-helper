/// <reference types="cypress" />
import React, { useState, useCallback, useMemo } from 'react';
import { Card } from 'antd';
import { SwimlaneSelector, Swimlane } from './SwimlaneSelector';

const manySwimlanesFixture: Swimlane[] = Array.from({ length: 20 }, (_, i) => ({
  id: `sw-${i + 1}`,
  name: `Swimlane ${i + 1}`,
}));

/** Per swimlane-selector.feature: Frontend, Backend, Expedite */
const threeSwimlanesFixture: Swimlane[] = [
  { id: 'fe', name: 'Frontend' },
  { id: 'be', name: 'Backend' },
  { id: 'ex', name: 'Expedite' },
];

/**
 * Ant Design Checkbox may place `data-testid` on the label wrapper or forward it
 * to the native input — use one helper so both DOM shapes work.
 */
const getAllSwimlanesCheckbox = () =>
  cy
    .get('[data-testid="swimlane-all-checkbox"]')
    .first()
    .then($root => {
      if ($root.is('input')) {
        return $root;
      }
      return $root.find('input[type="checkbox"]').first();
    });

/** Checkboxes for options inside the swimlane list (native inputs inside the group). */
const getSwimlaneListItemCheckboxes = () =>
  cy.get('[data-testid="swimlane-list"]').first().find('input[type="checkbox"]');

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
  /**
   * All / manual mode (issue #23) — must assert on visible DOM, not only callbacks.
   */
  describe('All vs manual selection (data-testid, checkbox state)', () => {
    it('all mode: value=[] shows checked All and no swimlane list in DOM', () => {
      cy.mount(<ControlledSwimlaneSelector swimlanes={threeSwimlanesFixture} initialValue={[]} />);
      getAllSwimlanesCheckbox().should('be.checked');
      cy.get('[data-testid="swimlane-list"]').should('not.exist');
    });

    it('click All to uncheck: checkbox becomes unchecked and swimlane list appears; click again hides list', () => {
      cy.mount(<ControlledSwimlaneSelector swimlanes={threeSwimlanesFixture} initialValue={[]} />);
      cy.get('[data-testid="swimlane-list"]').should('not.exist');
      getAllSwimlanesCheckbox().click();
      getAllSwimlanesCheckbox().should('not.be.checked');
      cy.get('[data-testid="swimlane-list"]').should('be.visible');
      cy.get('[data-testid="swimlane-list"]').should('contain.text', 'Frontend');
      cy.get('[data-testid="swimlane-list"]').should('contain.text', 'Backend');
      cy.get('[data-testid="swimlane-list"]').should('contain.text', 'Expedite');
      // Return to all mode: list hides
      getAllSwimlanesCheckbox().click();
      getAllSwimlanesCheckbox().should('be.checked');
      cy.get('[data-testid="swimlane-list"]').should('not.exist');
    });

    it('from partial selection, checking All calls onChange([]) and hides list (DOM + last emit)', () => {
      const onChange = cy.stub().as('onChange');
      const Harness: React.FC = () => {
        const [v, setV] = useState<string[]>(['fe', 'be']);
        return (
          <SwimlaneSelector
            swimlanes={threeSwimlanesFixture}
            value={v}
            onChange={ids => {
              onChange(ids);
              setV(ids);
            }}
          />
        );
      };
      cy.mount(<Harness />);
      cy.get('[data-testid="swimlane-list"]').should('be.visible');
      getAllSwimlanesCheckbox().should('not.be.checked');
      getAllSwimlanesCheckbox().click();
      cy.get<sinon.SinonStub>('@onChange').then(stub => {
        const calls = stub.getCalls();
        const last = calls[calls.length - 1];
        expect(last?.args[0]).to.deep.equal([]);
      });
      getAllSwimlanesCheckbox().should('be.checked');
      cy.get('[data-testid="swimlane-list"]').should('not.exist');
    });

    it('selecting all individual swimlanes normalizes to [] and returns to all mode (list hidden, All checked)', () => {
      const onChange = cy.stub().as('onChange');
      const Harness: React.FC = () => {
        const [v, setV] = useState<string[]>(['fe', 'be']);
        return (
          <SwimlaneSelector
            swimlanes={threeSwimlanesFixture}
            value={v}
            onChange={ids => {
              onChange(ids);
              setV(ids);
            }}
          />
        );
      };
      cy.mount(<Harness />);
      cy.get('[data-testid="swimlane-list"]').should('be.visible');
      cy.contains('label', 'Expedite').click();
      cy.get<sinon.SinonStub>('@onChange').then(stub => {
        const calls = stub.getCalls();
        const last = calls[calls.length - 1];
        expect(last?.args[0]).to.deep.equal([]);
      });
      getAllSwimlanesCheckbox().should('be.checked');
      cy.get('[data-testid="swimlane-list"]').should('not.exist');
    });

    it('REVIEW: initial value lists every available id — still manual mode (All unchecked, list visible, all options checked)', () => {
      cy.mount(<ControlledSwimlaneSelector swimlanes={threeSwimlanesFixture} initialValue={['fe', 'be', 'ex']} />);
      getAllSwimlanesCheckbox().should('not.be.checked');
      cy.get('[data-testid="swimlane-list"]').should('be.visible');
      getSwimlaneListItemCheckboxes().should('have.length', 3);
      getSwimlaneListItemCheckboxes().each($i => {
        cy.wrap($i).should('be.checked');
      });
    });

    it('REVIEW: value with stale/unknown id — manual mode, list visible, All unchecked', () => {
      cy.mount(<ControlledSwimlaneSelector swimlanes={threeSwimlanesFixture} initialValue={['fe', 'unknown-stale']} />);
      getAllSwimlanesCheckbox().should('not.be.checked');
      cy.get('[data-testid="swimlane-list"]').should('be.visible');
      cy.get('[data-testid="swimlane-list"]').should('contain.text', 'Frontend');
    });
  });

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
