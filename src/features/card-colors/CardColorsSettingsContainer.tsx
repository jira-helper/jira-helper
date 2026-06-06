import React, { useEffect, useState } from 'react';
import { CardColorsSettingsComponent } from './CardColorsSettingsComponent';
import { PropertyValue } from './types';

type FeatureProps = {
  getBoardProperty: (prop: string) => Promise<PropertyValue>;
  updateBoardProperty: (prop: string, value: PropertyValue) => any;
  forceTooltipOpen?: boolean;
};

export const CardColorsSettingsContainer: React.FC<FeatureProps> = props => {
  const [cardColorsEnabled, setCardColorsEnabled] = useState(false);

  useEffect(() => {
    const fetchCardColorsEnabled = async () => {
      const cardColorsProperty = await props.getBoardProperty('card-colors');
      setCardColorsEnabled(cardColorsProperty?.value === true);
    };

    fetchCardColorsEnabled();
  }, []);

  const handleCheckboxChange = async (newValue: boolean) => {
    setCardColorsEnabled(newValue);
    await props.updateBoardProperty('card-colors', {
      value: newValue,
    });
  };

  return (
    <CardColorsSettingsComponent
      cardColorsEnabled={cardColorsEnabled}
      onCardColorsEnabledChange={handleCheckboxChange}
      forceTooltipOpen={props.forceTooltipOpen}
    />
  );
};
