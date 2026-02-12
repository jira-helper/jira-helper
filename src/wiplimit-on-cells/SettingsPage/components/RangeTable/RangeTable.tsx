import React from 'react';
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
  return (
    <form className="aui">
      <table id="WipLimitCells_table" className="aui aui-table-list">
        <thead>
          <tr>
            <th style={{ width: '2%' }} scope="col" aria-label="Edit column" />
            <th style={{ width: '30%' }} scope="col">
              Range name
            </th>
            <th style={{ width: '10%' }} scope="col">
              WIP limit
            </th>
            <th style={{ width: '3%' }} scope="col">
              Disable
            </th>
            <th style={{ width: '50%' }} scope="col">
              Cells (swimlane/column)
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
