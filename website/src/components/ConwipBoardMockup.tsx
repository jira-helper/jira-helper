import React from 'react';

import styles from './ConwipBoardMockup.module.css';

/**
 * Infographic-only board mockup for CONWIP / column-group WIP docs (Docusaurus).
 */
export function ConwipBoardMockup(): React.ReactElement {
  const card = styles.card;

  return (
    <div className={styles.boardWrap} aria-hidden>
      <div className={styles.board}>
      <div className={styles.spacerTop} style={{gridColumn: '1', gridRow: '1'}} />
      <div className={`${styles.bannerBase} ${styles.bannerOk}`} style={{gridColumn: '2 / span 2', gridRow: '1'}}>
        <span className={styles.bannerLabel}>Ready to Test + Testing</span>
        <span className={styles.badgeOk}>3/5</span>
      </div>
      <div className={`${styles.bannerBase} ${styles.bannerOverload}`} style={{gridColumn: '4 / span 2', gridRow: '1'}}>
        <span className={styles.bannerLabel}>Code review + In progress</span>
        <span className={styles.badgeOverload}>5/3</span>
      </div>

      <div className={styles.headerBase} style={{gridColumn: '1', gridRow: '2'}}>Backlog</div>
      <div className={`${styles.headerBase} ${styles.headerGroupOk}`} style={{gridColumn: '2', gridRow: '2'}}>Ready to Test</div>
      <div className={`${styles.headerBase} ${styles.headerGroupOkLast}`} style={{gridColumn: '3', gridRow: '2'}}>Testing</div>
      <div className={`${styles.headerBase} ${styles.headerGroupBad}`} style={{gridColumn: '4', gridRow: '2'}}>Code review</div>
      <div className={`${styles.headerBase} ${styles.headerGroupBadLast}`} style={{gridColumn: '5', gridRow: '2'}}>In progress</div>
      <div className={styles.headerBase} style={{gridColumn: '6', gridRow: '2'}}>Done</div>

      <div className={styles.bodyBase} style={{gridColumn: '1', gridRow: '3'}}>
        <div className={card}>PROJ-3</div>
        <div className={card}>PROJ-5</div>
      </div>
      <div className={`${styles.bodyBase} ${styles.bodyGroupOk}`} style={{gridColumn: '2', gridRow: '3'}}>
        <div className={card}>PROJ-1</div>
        <div className={card}>PROJ-4</div>
      </div>
      <div className={`${styles.bodyBase} ${styles.bodyGroupOkMid}`} style={{gridColumn: '3', gridRow: '3'}}>
        <div className={card}>PROJ-2</div>
      </div>
      <div className={`${styles.bodyBase} ${styles.bodyGroupBad}`} style={{gridColumn: '4', gridRow: '3'}}>
        <div className={card}>PROJ-6</div>
        <div className={card}>PROJ-12</div>
      </div>
      <div className={`${styles.bodyBase} ${styles.bodyGroupBadLast}`} style={{gridColumn: '5', gridRow: '3'}}>
        <div className={card}>PROJ-7</div>
        <div className={card}>PROJ-8</div>
        <div className={card}>PROJ-9</div>
      </div>
      <div className={`${styles.bodyBase} ${styles.bodyPlainLast}`} style={{gridColumn: '6', gridRow: '3'}} />
      </div>
    </div>
  );
}
