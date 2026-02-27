import React, { useState } from 'react';
import { SettingsButton } from './SettingsButton';
import { SettingsModalContainer } from '../SettingsModal';
import { initFromProperty, saveToProperty } from '../../actions';
import type { SearchUsers } from '../../../../shared/di/jiraApiTokens';
import type { Column, Swimlane } from '../../state/types';

export type SettingsButtonContainerProps = {
  boardDataColumns: Column[];
  boardDataSwimlanes: Swimlane[];
  searchUsers: SearchUsers;
};

export const SettingsButtonContainer: React.FC<SettingsButtonContainerProps> = ({
  boardDataColumns,
  boardDataSwimlanes,
  searchUsers,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    initFromProperty();
    setIsModalOpen(true);
  };

  const handleClose = () => {
    initFromProperty();
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
          searchUsers={searchUsers}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </>
  );
};
