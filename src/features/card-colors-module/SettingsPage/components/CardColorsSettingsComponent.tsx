/**
 * View компонент для настроек цветов карточек.
 * Отвечает только за отображение, не содержит логики.
 *
 * @module CardColorsSettingsComponent
 */

import React from 'react';
import Checkbox from 'antd/es/checkbox';
import Tooltip from 'antd/es/tooltip';
import { InfoCircleFilled, LoadingOutlined } from '@ant-design/icons/';
import { Image } from 'src/shared/components/Image';
import styles from './CardColorsSettingsComponent.module.css';
import beforeImg from 'src/assets/card-colors-before.jpg';
import afterImg from 'src/assets/card-colors-after.jpg';

/**
 * Props для CardColorsSettingsComponent.
 */
interface CardColorsSettingsComponentProps {
  /**
   * Включены ли цвета карточек.
   */
  cardColorsEnabled: boolean;

  /**
   * Обработчик изменения состояния checkbox.
   */
  onCardColorsEnabledChange: (newValue: boolean) => void;

  /**
   * Принудительно открыть tooltip.
   */
  forceTooltipOpen?: boolean;

  /**
   * Идет ли загрузка данных.
   */
  isLoading?: boolean;

  /**
   * Идет ли сохранение данных.
   */
  isSaving?: boolean;

  /**
   * Сообщение об ошибке.
   */
  error?: string | null;
}

/**
 * View компонент для настроек цветов карточек.
 * Отвечает только за отображение, не содержит бизнес-логики.
 */
export const CardColorsSettingsComponent: React.FC<CardColorsSettingsComponentProps> = ({
  cardColorsEnabled,
  onCardColorsEnabledChange,
  forceTooltipOpen,
  isLoading = false,
  isSaving = false,
  error = null,
}) => {
  const handleCheckboxChange = (e: any) => {
    onCardColorsEnabledChange(e.target.checked);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.controlRow}>
        <Checkbox checked={cardColorsEnabled} onChange={handleCheckboxChange} disabled={isLoading || isSaving}>
          Fill whole card
          {(isLoading || isSaving) && <LoadingOutlined spin style={{ marginLeft: 8, color: '#1677ff' }} />}
        </Checkbox>
        <Tooltip
          open={forceTooltipOpen}
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

      {error && <div className={styles.error}>Error: {error}</div>}
    </div>
  );
};
