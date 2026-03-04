import React, { useState } from 'react';
import { SettingsButton } from './SettingsButton';
import { SettingsModalContainer } from '../SettingsModal';
import { useWipLimitCellsSettingsUIStore } from '../../stores/settingsUIStore';
import type { WipLimitRange } from '../../../types';

export type SettingsButtonContainerProps = {
  /** Доступные swimlanes */
  swimlanes: Array<{ id: string; name: string }>;
  /** Доступные columns */
  columns: Array<{ id: string; name: string }>;
  /** Функция для сохранения в Jira board property */
  onSaveToProperty: (ranges: WipLimitRange[]) => Promise<void>;
  /** Начальные данные ranges из Jira board property */
  initialRanges: WipLimitRange[];
};

/**
 * SettingsButtonContainer - Container компонент для кнопки редактирования WIP limits.
 * Управляет открытием/закрытием модального окна и синхронизацией данных с store.
 */
export const SettingsButtonContainer: React.FC<SettingsButtonContainerProps> = ({
  swimlanes,
  columns,
  onSaveToProperty,
  initialRanges,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRanges, setCurrentRanges] = useState(initialRanges);
  const { actions } = useWipLimitCellsSettingsUIStore();

  const handleOpen = () => {
    // Загрузить данные в UI Store из currentRanges (актуальные данные после сохранения)
    actions.setRanges(currentRanges);
    // Установить swimlanes и columns в store
    actions.setSwimlanes(swimlanes);
    actions.setColumns(columns);
    // Открыть модал
    setIsModalOpen(true);
  };

  const handleClose = () => {
    // Сбросить store к currentRanges (отмена изменений)
    actions.setRanges(currentRanges);
    // Закрыть модал
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    // Получить ranges из store
    const { data } = useWipLimitCellsSettingsUIStore.getState();
    // Вызвать onSaveToProperty с текущими ranges
    await onSaveToProperty(data.ranges);
    // Обновить локальное состояние для следующего открытия
    setCurrentRanges(data.ranges);
    // Закрыть модал
    setIsModalOpen(false);
  };

  return (
    <>
      <SettingsButton onClick={handleOpen} />
      {isModalOpen && (
        <SettingsModalContainer swimlanes={swimlanes} columns={columns} onClose={handleClose} onSave={handleSave} />
      )}
    </>
  );
};
