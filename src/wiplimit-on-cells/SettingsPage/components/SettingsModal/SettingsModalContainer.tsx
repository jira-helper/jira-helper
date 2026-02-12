import React, { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { RangeForm } from '../RangeForm/RangeForm';
import { RangeTable } from '../RangeTable/RangeTable';
import { useWipLimitCellsSettingsUIStore } from '../../stores/settingsUIStore';
import type { WipLimitCell } from '../../../types';

export type SettingsModalContainerProps = {
  /** Доступные swimlanes */
  swimlanes: Array<{ id: string; name: string }>;
  /** Доступные columns */
  columns: Array<{ id: string; name: string }>;
  /** Callback при закрытии модального окна */
  onClose: () => void;
  /** Callback при сохранении данных */
  onSave: () => void;
};

/**
 * SettingsModalContainer - Container компонент для модального окна редактирования WIP limits.
 * Подключается к useWipLimitCellsSettingsUIStore и рендерит RangeForm и RangeTable.
 */
export const SettingsModalContainer: React.FC<SettingsModalContainerProps> = ({
  swimlanes,
  columns,
  onClose,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const { data, actions } = useWipLimitCellsSettingsUIStore();

  /**
   * Получение label для ячейки (swimlane name / column name).
   */
  const getNameLabel = (swimlaneId: string, columnId: string): string => {
    const sw = swimlanes.find(s => s.id.toString() === swimlaneId.toString());
    const col = columns.find(c => c.id.toString() === columnId.toString());
    return `${sw?.name ?? 'Unknown'} / ${col?.name ?? 'Unknown'}`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    actions.setRanges([]);
    // Сохранить пустые данные
    onSave();
  };

  const handleAddRange = (name: string): boolean => {
    return actions.addRange(name);
  };

  const handleAddCell = (rangeName: string, cell: WipLimitCell): void => {
    actions.addCells(rangeName, cell);
  };

  const handleDeleteRange = (name: string): void => {
    actions.deleteRange(name);
  };

  const handleDeleteCell = (rangeName: string, swimlane: string, column: string): void => {
    actions.deleteCells(rangeName, swimlane, column);
  };

  const handleChangeField = (name: string, field: string, value: any): void => {
    actions.changeField(name, field, value);
  };

  const [selectedRangeName, setSelectedRangeName] = useState<string | null>(null);

  const handleSelectRange = (name: string) => {
    setSelectedRangeName(name);
  };

  return (
    <SettingsModal
      title="Edit WipLimit on cells"
      onSave={handleSave}
      onClose={onClose}
      onClear={handleClear}
      isSaving={isSaving}
    >
      <RangeForm
        swimlanes={swimlanes}
        columns={columns}
        onAddRange={handleAddRange}
        onAddCell={handleAddCell}
        existingRangeNames={data.ranges.map(r => r.name)}
        selectedRangeName={selectedRangeName}
        onRangeNameChange={setSelectedRangeName}
      />
      <RangeTable
        ranges={data.ranges}
        onDeleteRange={handleDeleteRange}
        onDeleteCell={handleDeleteCell}
        onChangeField={handleChangeField}
        onSelectRange={handleSelectRange}
        getNameLabel={getNameLabel}
      />
    </SettingsModal>
  );
};
