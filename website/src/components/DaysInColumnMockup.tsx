import React, {useState} from 'react';

import styles from './DaysInColumnMockup.module.css';

const cards = [
  {id: 'TASK-101', days: 1, col: 0},
  {id: 'TASK-99', days: 3, col: 1},
  {id: 'TASK-98', days: 7, col: 1},
  {id: 'TASK-95', days: 14, col: 1},
  {id: 'TASK-90', days: 2, col: 2},
];

const cols = ['To Do', 'In Progress', 'Done'];

function dayColor(days: number): 'ok' | 'warn' | 'danger' {
  if (days <= 3) return 'ok';
  if (days <= 7) return 'warn';
  return 'danger';
}

function Dots({days, color}: {days: number; color: string}) {
  return (
    <div className={styles.dots}>
      {Array.from({length: Math.min(days, 7)}, (_, i) => (
        <div key={i} className={styles.dot} style={{backgroundColor: color}} />
      ))}
    </div>
  );
}

export function DaysInColumnMockup(): React.ReactElement {
  const [showBadge, setShowBadge] = useState(false);

  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.toggleBar}>
        <button
          type="button"
          className={`${styles.toggle} ${showBadge ? styles.toggleActive : ''}`}
          onClick={() => setShowBadge(f => !f)}
          aria-label="Toggle days badge"
        >
          <div className={styles.toggleKnob} />
        </button>
        <span>Show days badge</span>
      </div>

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
                const c = dayColor(card.days);
                const dotColor = c === 'ok' ? 'var(--ifm-color-primary)' : c === 'warn' ? '#ff8b00' : 'var(--ifm-color-danger)';
                const badgeCls = c === 'ok' ? styles.dayOk : c === 'warn' ? styles.dayWarn : styles.dayDanger;
                return (
                  <div key={card.id} className={styles.card}>
                    <div>{card.id}</div>
                    {showBadge
                      ? <div className={`${styles.dayBadge} ${badgeCls}`}>{card.days}d</div>
                      : <Dots days={card.days} color={dotColor} />
                    }
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
