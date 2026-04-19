import React from 'react';
import { Tooltip } from 'antd';
import styles from './Histogram.module.css';
import type { SwimlaneHistogram } from '../../types';

export interface HistogramProps {
  data: SwimlaneHistogram;
}

export const Histogram: React.FC<HistogramProps> = ({ data }) => {
  const totalIssues = data.totalIssues || 1;
  const maxHeight = 20;

  return (
    <div className={styles.wrapper} data-testid="histogram">
      {data.columns.map((column, index) => {
        const barHeight = (maxHeight * column.issueCount) / totalIssues;
        const hasIssues = column.issueCount > 0;

        return (
          <Tooltip key={index} title={`${column.columnName}: ${column.issueCount}`}>
            <div
              className={styles.column}
              style={{ backgroundColor: hasIssues ? '#999' : '#eee' }}
              data-testid={`histogram-column-${index}`}
            >
              <div className={styles.bar} style={{ height: `${barHeight.toFixed(2)}px` }} />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};
