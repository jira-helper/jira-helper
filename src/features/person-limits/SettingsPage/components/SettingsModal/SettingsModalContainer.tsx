import React, { useState } from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useDi } from 'src/shared/diContext';
import { SettingsModal } from './SettingsModal';
import { PersonalWipLimitContainer } from '../PersonalWipLimitContainer';
import { createPersonLimit, updatePersonLimit } from '../../utils';
import { PERSON_LIMITS_TEXTS } from '../../texts';
import { settingsUIModelToken } from '../../../tokens';
import type { SearchUsers } from 'src/shared/di/jiraApiTokens';
import type { FormData, Column, Swimlane } from '../../state/types';

export type SettingsModalContainerProps = {
  columns: Column[];
  swimlanes: Swimlane[];
  searchUsers: SearchUsers;
  onClose: () => void;
  onSave: () => Promise<void>;
};

export const SettingsModalContainer: React.FC<SettingsModalContainerProps> = ({
  columns,
  swimlanes,
  searchUsers,
  onClose,
  onSave,
}) => {
  const texts = useGetTextsByLocale(PERSON_LIMITS_TEXTS);
  const [isSaving, setIsSaving] = useState(false);
  const { model: settingsUi } = useDi().inject(settingsUIModelToken);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLimit = (formData: FormData): void => {
    if (settingsUi.editingId !== null) {
      const existingLimit = settingsUi.limits.find(l => l.id === settingsUi.editingId);
      if (!existingLimit) return;
      const updatedLimit = updatePersonLimit({ existingLimit, formData, columns, swimlanes });
      settingsUi.updateLimit(settingsUi.editingId, updatedLimit);
    } else {
      if (!formData.person) return;
      const personLimit = createPersonLimit({
        formData,
        person: {
          name: formData.person.name,
          displayName: formData.person.displayName,
          self: formData.person.self,
        },
        columns,
        swimlanes,
        id: Date.now(),
      });
      settingsUi.addLimit(personLimit);
    }
  };

  return (
    <SettingsModal
      title={texts.modalTitle}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
      okButtonText={texts.save}
      cancelButtonText={texts.cancel}
    >
      <PersonalWipLimitContainer
        columns={columns}
        swimlanes={swimlanes}
        searchUsers={searchUsers}
        onAddLimit={handleAddLimit}
      />
    </SettingsModal>
  );
};
