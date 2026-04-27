/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React, { useState, useEffect } from 'react';
import { Checkbox } from 'antd';

export type Swimlane = {
  id: string;
  name: string;
};

export interface SwimlaneSelectorProps {
  /** Available swimlanes to choose from */
  swimlanes: Swimlane[];
  /** Currently selected swimlane IDs (empty = all) */
  value: string[];
  /** Callback when selection changes */
  onChange: (selectedIds: string[]) => void;
  /** Label text (default: "Swimlanes"). Pass null to hide. */
  label?: string | null;
  /** "All" checkbox text (default: "All swimlanes") */
  allLabel?: string;
}

const listContainerStyle: React.CSSProperties = {
  maxHeight: '200px',
  overflowY: 'auto',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  padding: '8px',
  marginBottom: 8,
};

export const SwimlaneSelector: React.FC<SwimlaneSelectorProps> = ({
  swimlanes = [],
  value = [],
  onChange,
  label = 'Swimlanes',
  allLabel = 'All swimlanes',
}) => {
  const safeSwimlanes = swimlanes ?? [];
  const safeValue = value ?? [];
  const allIds = safeSwimlanes.map(s => s.id);

  // Track if user has expanded the list by unchecking "All"
  const [expanded, setExpanded] = useState(false);

  // Sync expanded state with selection:
  // - Partial selection: expand to show individual checkboxes
  // - All selected (empty array or full array): collapse the list
  useEffect(() => {
    const isPartialSelection = safeValue.length > 0 && safeValue.length < safeSwimlanes.length;
    const isAllSelected = safeValue.length === 0 || safeValue.length === safeSwimlanes.length;
    if (isPartialSelection) {
      setExpanded(true);
    } else if (isAllSelected) {
      setExpanded(false);
    }
  }, [safeValue.length, safeSwimlanes.length]);

  const allChecked = safeValue.length === 0 || safeValue.length === safeSwimlanes.length;
  const isPartialSelection = safeValue.length > 0 && safeValue.length < safeSwimlanes.length;
  const showList = expanded || isPartialSelection;
  const displayValue = safeValue.length === 0 ? allIds : safeValue;

  const handleAllChange = (e: { target: { checked: boolean } }) => {
    if (e.target.checked) {
      // User checked "All" - collapse the list and emit empty (= all)
      setExpanded(false);
      onChange([]);
    } else {
      // User unchecked "All" - just expand the list to show individual checkboxes
      // NO onChange here - selection hasn't changed yet, user just wants to see the list
      setExpanded(true);
    }
  };

  const handleListChange = (values: (string | number)[]) => {
    const newValues = (values as string[]).map(String);
    // Keep list expanded when changing individual items
    // Emit [] if all selected (convention), otherwise emit specific IDs
    if (newValues.length === safeSwimlanes.length) {
      onChange([]);
    } else {
      onChange(newValues);
    }
  };

  return (
    <div>
      {label != null && <div style={{ marginBottom: 8, fontWeight: 500 }}>{label}</div>}
      <Checkbox
        data-testid="swimlane-all-checkbox"
        style={{ marginBottom: 8 }}
        checked={allChecked}
        onChange={handleAllChange}
      >
        {allLabel}
      </Checkbox>
      {showList && (
        <div data-testid="swimlane-list" style={listContainerStyle}>
          <Checkbox.Group
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}
            value={displayValue}
            options={safeSwimlanes.map(s => ({ label: s.name, value: s.id }))}
            onChange={handleListChange}
          />
        </div>
      )}
    </div>
  );
};
