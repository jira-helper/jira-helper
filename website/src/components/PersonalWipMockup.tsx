import React from 'react';

import styles from './PersonalWipMockup.module.css';

export function PersonalWipMockup(): React.ReactElement {
  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.board}>
        <div className={styles.avatars}>
          <div className={`${styles.avatar} ${styles.avatarOk}`}>
            <div className={styles.avatarFace}>A</div>
            <span className={`${styles.avatarCount} ${styles.avatarCountOk}`}>1/3</span>
          </div>
          <div className={`${styles.avatar} ${styles.avatarOverload}`}>
            <div className={styles.avatarFace}>B</div>
            <span className={`${styles.avatarCount} ${styles.avatarCountOverload}`}>4/3</span>
          </div>
        </div>

        <div className={styles.columns}>
          <div className={styles.colHeader}>To Do</div>
          <div className={styles.colHeader}>In Progress</div>
          <div className={`${styles.colHeader} ${styles.colHeaderLast}`}>Done</div>

          <div className={styles.cell}>
            <div className={styles.cardWarnBg}>
              <div className={styles.cardRow}>
                <div className={`${styles.cardAvatar} ${styles.cardAvatarB}`}>B</div>
                <span>TASK-201</span>
              </div>
            </div>
          </div>
          <div className={styles.cell}>
            <div className={styles.card}>
              <div className={styles.cardRow}>
                <div className={`${styles.cardAvatar} ${styles.cardAvatarA}`}>A</div>
                <span>TASK-95</span>
              </div>
            </div>
            <div className={styles.cardWarnBg}>
              <div className={styles.cardRow}>
                <div className={`${styles.cardAvatar} ${styles.cardAvatarB}`}>B</div>
                <span>TASK-99</span>
              </div>
            </div>
            <div className={styles.cardWarnBg}>
              <div className={styles.cardRow}>
                <div className={`${styles.cardAvatar} ${styles.cardAvatarB}`}>B</div>
                <span>TASK-98</span>
              </div>
            </div>
            <div className={styles.cardWarnBg}>
              <div className={styles.cardRow}>
                <div className={`${styles.cardAvatar} ${styles.cardAvatarB}`}>B</div>
                <span>TASK-97</span>
              </div>
            </div>
          </div>
          <div className={`${styles.cell} ${styles.cellLast}`}>
            <div className={styles.card}>
              <div className={styles.cardRow}>
                <div className={`${styles.cardAvatar} ${styles.cardAvatarB}`}>B</div>
                <span>TASK-190</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
