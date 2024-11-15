import React, { useEffect, useState } from 'react';
import { CardColorsSettingsComponentPure } from './CardColorsSettingsComponentPure';
import { updateBoardProperty, getBoardProperty } from '../shared/jiraApi';
import { getBoardIdFromURL } from '../shared/utils';

const CardColorsSettingsContainer: React.FC = () => {
  const [cardColorsEnabled, setCardColorsEnabled] = useState(false);

  useEffect(() => {
    const fetchCardColorsEnabled = async () => {
      const boardId = getBoardIdFromURL();
      const cardColorsEnabled = await getBoardProperty(boardId, 'card-colors');
      setCardColorsEnabled(cardColorsEnabled === true);
    };

    fetchCardColorsEnabled();
  }, []);

  const handleCheckboxChange = async (newValue: boolean) => {
    const boardId = getBoardIdFromURL();
    setCardColorsEnabled(newValue);
    await updateBoardProperty(boardId, 'card-colors', newValue);
  };

  return (
    <CardColorsSettingsComponentPure
      cardColorsEnabled={cardColorsEnabled}
      onCardColorsEnabledChange={handleCheckboxChange}
    />
  );
};

export default CardColorsSettingsContainer;
