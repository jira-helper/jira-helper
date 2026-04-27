/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import { WIPLIMIT_CELLS_TEXTS } from '../../texts';
import type { WipLimitRange } from '../../../types';
import { RangeRow } from './RangeRow';

export interface RangeTableProps {
  /** Массив ranges для отображения */
  ranges: WipLimitRange[];
  /** Callback при удалении range */
  onDeleteRange: (name: string) => void;
  /** Callback при удалении ячейки */
  onDeleteCell: (rangeName: string, swimlane: string, column: string) => void;
  /** Callback при изменении поля range */
  onChangeField: (name: string, field: string, value: any) => void;
  /** Callback при выборе range (для редактирования) */
  onSelectRange: (name: string) => void;
  /** Функция для получения label ячейки */
  getNameLabel: (swimlaneId: string, columnId: string) => string;
}

/**
 * RangeTable - View компонент для отображения таблицы ranges.
 * Заменяет императивный DOM-код из table.ts на React-компоненты.
 */
export const RangeTable: React.FC<RangeTableProps> = ({
  ranges,
  onDeleteRange,
  onDeleteCell,
  onChangeField,
  onSelectRange,
  getNameLabel,
}) => {
  const texts = useGetTextsByLocale(WIPLIMIT_CELLS_TEXTS);

  return (
    <form className="aui">
      <table id="WipLimitCells_table" data-testid="ranges table" className="aui aui-table-list">
        <thead>
          <tr>
            <th style={{ width: '2%' }} scope="col" aria-label={texts.editColumn} />
            <th style={{ width: '30%' }} scope="col">
              {texts.rangeName}
            </th>
            <th style={{ width: '10%' }} scope="col">
              {texts.wipLimit}
            </th>
            <th style={{ width: '3%' }} scope="col">
              {texts.disable}
            </th>
            <th style={{ width: '50%' }} scope="col">
              {texts.cellsHeader}
            </th>
          </tr>
        </thead>
        <tbody id="WipLimitCells_tbody">
          {ranges.map(range => (
            <RangeRow
              key={range.name}
              range={range}
              onDelete={() => onDeleteRange(range.name)}
              onDeleteCell={(swimlane, column) => onDeleteCell(range.name, swimlane, column)}
              onChangeField={(field, value) => onChangeField(range.name, field, value)}
              onSelect={() => onSelectRange(range.name)}
              getNameLabel={getNameLabel}
            />
          ))}
        </tbody>
      </table>
    </form>
  );
};
