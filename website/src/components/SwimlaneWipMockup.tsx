import React from 'react';

import styles from './SwimlaneWipMockup.module.css';

export function SwimlaneWipMockup(): React.ReactElement {
  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.board}>
        <div className={styles.colHeader} style={{gridColumn: '1', gridRow: '1'}}>To Do</div>
        <div className={styles.colHeader} style={{gridColumn: '2', gridRow: '1'}}>In Progress</div>
        <div className={styles.colHeader} style={{gridColumn: '3', gridRow: '1'}}>Done</div>

        <div className={`${styles.swimHeader} ${styles.swimHeaderOk}`} style={{gridColumn: '1 / -1', gridRow: '2'}}>
          <span className={styles.swimLabel}>Team Frontend</span>
          <span className={`${styles.badge} ${styles.badgeOk}`}>2/5</span>
        </div>
        <div className={styles.cellOk} style={{gridColumn: '1', gridRow: '3'}}>
          <div className={styles.card}>TASK-101</div>
        </div>
        <div className={styles.cellOk} style={{gridColumn: '2', gridRow: '3'}}>
          <div className={styles.card}>TASK-99</div>
        </div>
        <div className={`${styles.cellOk} ${styles.cellLast}`} style={{gridColumn: '3', gridRow: '3'}} />

        <div className={`${styles.swimHeader} ${styles.swimHeaderOverload}`} style={{gridColumn: '1 / -1', gridRow: '4'}}>
          <span className={styles.swimLabel}>Team Backend</span>
          <span className={`${styles.badge} ${styles.badgeOverload}`}>4/3</span>
        </div>
        <div className={styles.cellOverload} style={{gridColumn: '1', gridRow: '5'}}>
          <div className={styles.card}>TASK-201</div>
        </div>
        <div className={styles.cellOverload} style={{gridColumn: '2', gridRow: '5'}}>
          <div className={`${styles.card} ${styles.cardWarn}`}>TASK-199</div>
          <div className={`${styles.card} ${styles.cardWarn}`}>TASK-198</div>
        </div>
        <div className={`${styles.cellOverload} ${styles.cellLast}`} style={{gridColumn: '3', gridRow: '5'}}>
          <div className={styles.card}>TASK-190</div>
        </div>
      </div>
    </div>
  );
}
