import React from 'react';
import Checkbox from 'antd/es/checkbox';
import Tooltip from 'antd/es/tooltip';
import { InfoCircleFilled } from '@ant-design/icons/';
import { Image } from '../shared/components/Image';
import styles from './CardColorsSettingsComponent.module.css';
import beforeImg from '../assets/card-colors-before.jpg';
import afterImg from '../assets/card-colors-after.jpg';

type ColorCardFeatureProps = {
  cardColorsEnabled: boolean;
  onCardColorsEnabledChange: (newValue: boolean) => void;
  forceTooltipOpen?: boolean;
};

export const CardColorsSettingsComponent: React.FC<ColorCardFeatureProps> = props => {
  const handleCheckboxChange = (e: any) => {
    props.onCardColorsEnabledChange(e.target.checked);
  };

  return (
    <div className={styles.wrapper}>
      <Checkbox

        checked={props.cardColorsEnabled} onChange={handleCheckboxChange}>
        Fill whole card
      </Checkbox>
      <Tooltip
        open={props.forceTooltipOpen}
        overlayStyle={{
          // 250 - is default and its small
          maxWidth: 600,
        }}
        title={
          <>
            <p>Feature makes that whole card is colored, instead of just line on left side</p>
            <div className={styles.exampleWithImages}>
              <span className={styles.example}>
                Before
                <Image src={beforeImg} />
              </span>
              <span className={styles.example}>
                After
                <Image src={afterImg} />
              </span>
            </div>
          </>
        }
      >
        <span>
          <InfoCircleFilled style={{ color: '#1677ff' }} />
        </span>
      </Tooltip>
    </div>
  );
};
