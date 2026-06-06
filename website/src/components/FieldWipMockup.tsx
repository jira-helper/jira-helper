import React from 'react';

import styles from './FieldWipMockup.module.css';

export function FieldWipMockup(): React.ReactElement {
  const tagA = `${styles.cardFieldTag} ${styles.cardFieldTagA}`;
  const tagB = `${styles.cardFieldTag} ${styles.cardFieldTagB}`;

  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.board}>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles.badgeOverload}`}>FieldA 4/3</span>
          <span className={`${styles.badge} ${styles.badgeOk}`}>FieldB 2/5</span>
        </div>

        <div className={styles.columns}>
          <div className={styles.colHeader}>To Do</div>
          <div className={styles.colHeader}>In Progress</div>
          <div className={`${styles.colHeader} ${styles.colHeaderLast}`}>Done</div>

          <div className={styles.cell}>
            <div className={styles.cardWarnBg}>
              TASK-101 <span className={tagA}>A</span>
            </div>
            <div className={styles.cardWarnBg}>
              TASK-102 <span className={tagA}>A</span>
            </div>
            <div className={styles.card}>
              TASK-103 <span className={tagB}>B</span>
            </div>
          </div>
          <div className={styles.cell}>
            <div className={styles.cardWarnBg}>
              TASK-99 <span className={tagA}>A</span>
            </div>
            <div className={styles.cardWarnBg}>
              TASK-98 <span className={tagA}>A</span>
            </div>
            <div className={styles.card}>
              TASK-97 <span className={tagB}>B</span>
            </div>
          </div>
          <div className={`${styles.cell} ${styles.cellLast}`} />
        </div>
      </div>
    </div>
  );
}
