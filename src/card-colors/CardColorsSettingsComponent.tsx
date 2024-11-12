import React, { useEffect, useState } from 'react';
import { Image } from '../shared/components/Image';

import beforeImg from '../assets/card-colors-before.jpg';
import afterImg from '../assets/card-colors-after.jpg';


import Checkbox from 'antd/es/checkbox';
import Tooltip from 'antd/es/tooltip';
import { InfoCircleFilled } from '@ant-design/icons/';
import styles from './CardColorsSettingsComponent.module.css'

type ColorCardFeatureProps = {
  forceTooltipOpen?: boolean
}

export const ColorCardSettingsComponent: React.FC<ColorCardFeatureProps> = (props) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.wrapper}>
      <Checkbox>Fill whole card</Checkbox>
      <Tooltip
        open={props.forceTooltipOpen}
        overlayStyle={{
          // 250 - is default and its small
          maxWidth: 600
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
        <span ><InfoCircleFilled style={{ color: '#1677ff' }} /></span>
      </Tooltip>
    </div >
  );
};
