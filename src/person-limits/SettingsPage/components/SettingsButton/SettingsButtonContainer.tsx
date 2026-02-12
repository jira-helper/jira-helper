import React, { useState } from 'react';
import { SettingsButton } from './SettingsButton';
import { SettingsModalContainer } from '../SettingsModal';
import { initFromProperty, saveToProperty } from '../../actions';
import type { Column, Swimlane } from '../../state/types';

export type SettingsButtonContainerProps = {
  boardDataColumns: Column[];
  boardDataSwimlanes: Swimlane[];
};

export const SettingsButtonContainer: React.FC<SettingsButtonContainerProps> = ({
  boardDataColumns,
  boardDataSwimlanes,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    initFromProperty();
    setIsModalOpen(true);
  };

  const handleClose = () => {
    initFromProperty(); // restore state on cancel
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    await saveToProperty();
    setIsModalOpen(false);
  };

  return (
    <>
      <SettingsButton onClick={handleOpen} />
      {isModalOpen && (
        <SettingsModalContainer
          columns={boardDataColumns}
          swimlanes={boardDataSwimlanes}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </>
  );
};
