import React, { useState } from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useDi } from 'src/infrastructure/di/diContext';
import { SettingsButton } from './SettingsButton';
import { propertyModelToken, settingsUIModelToken } from '../../../tokens';
import type { SettingsUIModel } from '../../models/SettingsUIModel';
import { mapColumnsToGroups } from '../../../shared/utils';
import { buildInitDataFromGroupMap } from '../../utils/buildInitData';
import { WITHOUT_GROUP_ID } from '../../../types';
import { SettingsModalContainer } from '../SettingsModal';
import { COLUMN_LIMITS_TEXTS } from '../../texts';

export type SettingsButtonContainerProps = {
  getColumns: () => NodeListOf<Element>;
  getColumnName: (el: HTMLElement) => string;
  swimlanes?: Array<{ id: string; name: string }>;
};

export const SettingsButtonContainer: React.FC<SettingsButtonContainerProps> = ({
  getColumns,
  getColumnName,
  swimlanes = [],
}) => {
  const texts = useGetTextsByLocale(COLUMN_LIMITS_TEXTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { model: propertyModel } = useDi().inject(propertyModelToken);
  const { model: settingsModel } = useDi().inject(settingsUIModelToken);
  const settingsUi = settingsModel as SettingsUIModel;

  const handleOpen = () => {
    const wipLimits = propertyModel.data;
    const columns = Array.from(getColumns()) as HTMLElement[];

    const groupMap = mapColumnsToGroups({
      columnsHtmlNodes: columns,
      wipLimits,
      withoutGroupId: WITHOUT_GROUP_ID,
    });

    const initData = buildInitDataFromGroupMap(groupMap, wipLimits, getColumnName);

    settingsUi.reset();
    settingsUi.initFromProperty(initData);

    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    const columnIds = Array.from(getColumns())
      .map(el => el.getAttribute('data-column-id'))
      .filter((id): id is string => id != null);

    await settingsUi.save(columnIds);
    setIsModalOpen(false);
  };

  return (
    <>
      <SettingsButton onClick={handleOpen} label={texts.settingsButton} />
      {isModalOpen && <SettingsModalContainer onClose={handleClose} onSave={handleSave} swimlanes={swimlanes} />}
    </>
  );
};
