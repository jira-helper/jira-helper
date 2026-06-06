import React from 'react';
import { ColorPicker } from 'antd';
import type { ColorPickerProps } from 'antd/es/color-picker';
import styles from './ColorPickerButton.module.css';

export type ColorPickerButtonProps = {
  groupId: string;
  currentColor?: string;
  selectColorText: string;
  onColorChange: (color: string) => void;
};

const PRESET_COLORS = [
  '#ff5722',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#795548',
];

export const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({
  groupId,
  currentColor = '#ffffff',
  selectColorText,
  onColorChange,
}) => {
  const handleChange: ColorPickerProps['onChange'] = (color) => {
    onColorChange(color.toHexString());
  };

  return (
    <div className={styles.container} data-group-id={groupId}>
      <ColorPicker
        value={currentColor}
        onChange={handleChange}
        presets={[{ label: selectColorText, colors: PRESET_COLORS }]}
        disabledAlpha
      >
        <span className={styles.button} aria-label={selectColorText}>
          <span className={styles.colorPreview} style={{ backgroundColor: currentColor }} />
          Change color
        </span>
      </ColorPicker>
    </div>
  );
};
