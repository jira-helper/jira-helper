import React, { useState, useRef, useEffect } from 'react';
import styles from './ColorPickerButton.module.css';

/**
 * ColorPickerButtonProps - props for ColorPickerButton.
 */
export type ColorPickerButtonProps = {
  /**
   * Group ID for which the color is being picked.
   */
  groupId: string;
  /**
   * Current hex color string (e.g., '#ffffff').
   */
  currentColor?: string;
  /**
   * Localized "Select color" text for aria-label.
   */
  selectColorText: string;
  /**
   * Callback called when color is changed.
   */
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

/**
 * ColorPickerButton - a button that opens a color picker popover.
 * Used in ColumnLimitsForm to change group colors.
 */
export const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({
  groupId,
  currentColor = '#ffffff',
  selectColorText,
  onColorChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button type="button" className={styles.button} onClick={() => setIsOpen(!isOpen)} data-group-id={groupId}>
        <span className={styles.colorPreview} style={{ backgroundColor: currentColor }} />
        Change color
      </button>

      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.colorGrid}>
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                className={styles.colorOption}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                aria-label={`${selectColorText} ${color}`}
              />
            ))}
          </div>
          <div className={styles.customColor}>
            <label>
              Custom:
              <input type="color" value={currentColor} onChange={e => handleColorSelect(e.target.value)} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
