/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React, { useState, useEffect, useRef } from 'react';
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

  /**
   * User can open manual mode with value still [] (convention: all) until they pick
   * individual items — in that case "All" must be unchecked and list shown (issue #23).
   * External prop change from a non-empty selection to [] resets this (e.g. parent/save).
   */
  const [userOpenedManual, setUserOpenedManual] = useState(false);

  /** Reset local UI when the parent forces selection from "something" to [] (e.g. save/load) without the All control. */
  const prevValueLenRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevValueLenRef.current === null) {
      prevValueLenRef.current = safeValue.length;
      return;
    }
    if (prevValueLenRef.current > 0 && safeValue.length === 0) {
      setUserOpenedManual(false);
    }
    prevValueLenRef.current = safeValue.length;
  }, [safeValue.length]);

  /** All mode: persisted/semantic `[]` only; any non-`[]` `value` is manual selection (incl. full id list) until `handleListChange` normalizes. */
  const allChecked = safeValue.length === 0 && !userOpenedManual;

  const showList = userOpenedManual || safeValue.length > 0;

  const valueIdSet = new Set(safeValue);
  const displayValue: string[] = safeSwimlanes.map(s => s.id).filter(id => valueIdSet.has(id));

  const handleAllChange = (e: { target: { checked: boolean } }) => {
    if (e.target.checked) {
      // User checked "All" - collapse the list and emit empty (= all)
      setUserOpenedManual(false);
      onChange([]);
    } else {
      // User unchecked "All" - show the list; no onChange until individual picks (FR-2 / open Q)
      setUserOpenedManual(true);
    }
  };

  const handleListChange = (values: (string | number)[]) => {
    const newValues = (values as string[]).map(String);
    // Keep list expanded when changing individual items
    // Emit [] if all selected (convention), otherwise emit specific IDs
    if (newValues.length === safeSwimlanes.length) {
      setUserOpenedManual(false);
      onChange([]);
    } else {
      if (newValues.length === 0) {
        setUserOpenedManual(false);
      }
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
