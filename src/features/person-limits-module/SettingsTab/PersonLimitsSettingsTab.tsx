import React, { useEffect, useState } from 'react';
import { Button, Space } from 'antd';
import { useDi } from 'src/infrastructure/di/diContext';
import { useGetTextsByLocale } from 'src/shared/texts';
import { settingsUIModelToken, boardRuntimeModelToken } from '../tokens';
import { searchUsersToken } from 'src/infrastructure/di/jiraApiTokens';
import { PersonalWipLimitContainer } from '../SettingsPage/components/PersonalWipLimitContainer';
import { createPersonLimit } from '../SettingsPage/utils/createPersonLimit';
import { updatePersonLimit } from '../SettingsPage/utils/updatePersonLimit';
import { PERSON_LIMITS_TEXTS } from '../SettingsPage/texts';
import type { FormData, Column, Swimlane } from '../SettingsPage/state/types';

export type PersonLimitsSettingsTabProps = {
  columns: Column[];
  swimlanes: Swimlane[];
};

export const PersonLimitsSettingsTab: React.FC<PersonLimitsSettingsTabProps> = ({ columns, swimlanes }) => {
  const texts = useGetTextsByLocale(PERSON_LIMITS_TEXTS);
  const [isSaving, setIsSaving] = useState(false);

  const container = useDi();
  const { model: settingsUi } = container.inject(settingsUIModelToken);
  const { model: runtimeModel } = container.inject(boardRuntimeModelToken);
  const searchUsers = container.inject(searchUsersToken);

  useEffect(() => {
    settingsUi.initFromProperty();
  }, []);

  const handleAddLimit = (formData: FormData): void => {
    if (settingsUi.editingId !== null) {
      const existingLimit = settingsUi.limits.find(l => l.id === settingsUi.editingId);
      if (!existingLimit) return;
      const updatedLimit = updatePersonLimit({ existingLimit, formData, columns, swimlanes });
      settingsUi.updateLimit(settingsUi.editingId, updatedLimit);
    } else {
      if (!formData.persons[0]) return;
      const personLimit = createPersonLimit({
        formData,
        person: {
          name: formData.persons[0].name,
          displayName: formData.persons[0].displayName,
          self: formData.persons[0].self,
        },
        columns,
        swimlanes,
        id: Date.now(),
      });
      settingsUi.addLimit(personLimit);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsUi.save();
      runtimeModel.apply();
      runtimeModel.showOnlyChosen();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    settingsUi.initFromProperty();
  };

  return (
    <div>
      <PersonalWipLimitContainer
        columns={columns}
        swimlanes={swimlanes}
        searchUsers={searchUsers}
        onAddLimit={handleAddLimit}
      />
      <Space style={{ marginTop: 16, width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={handleSave} loading={isSaving}>
          {texts.saveConfig}
        </Button>
        <Button onClick={handleCancel} disabled={isSaving}>
          {texts.discardChanges}
        </Button>
      </Space>
    </div>
  );
};
