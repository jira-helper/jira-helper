import React from 'react';

import styles from './CellWipMockup.module.css';

export function CellWipMockup(): React.ReactElement {
  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.board}>
        <div className={styles.colHeader} style={{gridColumn: '1', gridRow: '1'}}>To Do</div>
        <div className={styles.colHeader} style={{gridColumn: '2', gridRow: '1'}}>In Progress</div>
        <div className={styles.colHeader} style={{gridColumn: '3', gridRow: '1'}}>Done</div>

        <div className={styles.swimHeader} style={{gridColumn: '1 / -1', gridRow: '2'}}>
          <span className={styles.swimLabel}>Team Frontend</span>
        </div>
        <div className={styles.cell} style={{gridColumn: '1', gridRow: '3'}}>
          <div className={styles.card}>TASK-101</div>
        </div>
        <div className={styles.cell} style={{gridColumn: '2', gridRow: '3'}}>
          <div className={styles.card}>TASK-99</div>
        </div>
        <div className={`${styles.cell} ${styles.cellLast}`} style={{gridColumn: '3', gridRow: '3'}} />

        <div className={styles.swimHeader} style={{gridColumn: '1 / -1', gridRow: '4'}}>
          <span className={styles.swimLabel}>Team Backend</span>
        </div>
        <div className={styles.cell} style={{gridColumn: '1', gridRow: '5'}}>
          <div className={styles.card}>TASK-201</div>
        </div>
        <div className={`${styles.cell} ${styles.cellLimited}`} style={{gridColumn: '2', gridRow: '5'}}>
          <span className={styles.cellBadge}>4/3</span>
          <div className={styles.card}>TASK-199</div>
          <div className={styles.card}>TASK-198</div>
          <div className={styles.card}>TASK-197</div>
          <div className={styles.card}>TASK-196</div>
        </div>
        <div className={`${styles.cell} ${styles.cellLast}`} style={{gridColumn: '3', gridRow: '5'}}>
          <div className={styles.card}>TASK-190</div>
        </div>
      </div>
    </div>
  );
}
