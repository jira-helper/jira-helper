import React from 'react';

import styles from './SubTasksProgressMockup.module.css';

const cards = [
  {id: 'PROJ-12', col: 0, done: 0, wip: 1, todo: 3, blocked: 0},
  {id: 'PROJ-10', col: 1, done: 2, wip: 1, todo: 0, blocked: 1},
  {id: 'PROJ-9', col: 1, done: 3, wip: 2, todo: 2, blocked: 0},
  {id: 'PROJ-7', col: 2, done: 5, wip: 0, todo: 0, blocked: 0},
];

const cols = ['To Do', 'In Progress', 'Done'];

export function SubTasksProgressMockup(): React.ReactElement {
  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.board}>
        <div className={styles.columns}>
          {cols.map((name, i) => (
            <div key={name} className={`${styles.colHeader} ${i === cols.length - 1 ? styles.colHeaderLast : ''}`}>
              {name}
            </div>
          ))}
          {cols.map((_, colIdx) => (
            <div
              key={colIdx}
              className={`${styles.cell} ${colIdx === cols.length - 1 ? styles.cellLast : ''}`}
            >
              {cards.filter(c => c.col === colIdx).map(card => {
                const total = card.done + card.wip + card.todo + card.blocked;
                if (total === 0) {
                  return (
                    <div key={card.id} className={styles.card}>
                      <div>{card.id}</div>
                    </div>
                  );
                }
                return (
                  <div key={card.id} className={styles.card}>
                    <div>{card.id}</div>
                    <div className={styles.progressBar}>
                      {card.done > 0 && <div className={styles.progressDone} style={{width: `${(card.done / total) * 100}%`}} />}
                      {card.wip > 0 && <div className={styles.progressWip} style={{width: `${(card.wip / total) * 100}%`}} />}
                      {card.blocked > 0 && <div className={styles.progressBlocked} style={{width: `${(card.blocked / total) * 100}%`}} />}
                      {card.todo > 0 && <div className={styles.progressTodo} style={{width: `${(card.todo / total) * 100}%`}} />}
                    </div>
                    <div className={styles.progressLabel}>
                      {card.done}/{total}{card.blocked > 0 && ` · ${card.blocked} blocked`}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
