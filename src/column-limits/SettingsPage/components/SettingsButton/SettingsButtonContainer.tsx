import React, { useState } from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import { SettingsButton } from './SettingsButton';
import { useColumnLimitsPropertyStore } from '../../../property/store';
import { useColumnLimitsSettingsUIStore } from '../../stores/settingsUIStore';
import { mapColumnsToGroups } from '../../../shared/utils';
import { buildInitDataFromGroupMap } from '../../utils/buildInitData';
import { initFromProperty, saveToProperty } from '../../actions';
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

  const handleOpen = () => {
    const wipLimits = useColumnLimitsPropertyStore.getState().data;
    const columns = Array.from(getColumns()) as HTMLElement[];

    const groupMap = mapColumnsToGroups({
      columnsHtmlNodes: columns,
      wipLimits,
      withoutGroupId: WITHOUT_GROUP_ID,
    });

    const initData = buildInitDataFromGroupMap(groupMap, wipLimits, getColumnName);

    useColumnLimitsSettingsUIStore.getState().actions.reset();
    initFromProperty(initData);

    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    const columnIds = Array.from(getColumns())
      .map(el => el.getAttribute('data-column-id'))
      .filter((id): id is string => id != null);

    await saveToProperty(columnIds);
    setIsModalOpen(false);
  };

  return (
    <>
      <SettingsButton onClick={handleOpen} label={texts.settingsButton} />
      {isModalOpen && <SettingsModalContainer onClose={handleClose} onSave={handleSave} swimlanes={swimlanes} />}
    </>
  );
};
