import React, { useState } from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useDi } from 'src/infrastructure/di/diContext';
import { SettingsButton } from './SettingsButton';
import { SettingsModalContainer } from '../SettingsModal';
import { PERSON_LIMITS_TEXTS } from '../../texts';
import { settingsUIModelToken } from '../../../tokens';
import type { SearchUsers } from 'src/infrastructure/di/jiraApiTokens';
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
  const texts = useGetTextsByLocale(PERSON_LIMITS_TEXTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { model: settingsUi } = useDi().inject(settingsUIModelToken);

  const handleOpen = () => {
    settingsUi.initFromProperty();
    setIsModalOpen(true);
  };

  const handleClose = () => {
    settingsUi.initFromProperty();
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    await settingsUi.save();
    setIsModalOpen(false);
  };

  return (
    <>
      <SettingsButton onClick={handleOpen} label={texts.settingsButton} />
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
