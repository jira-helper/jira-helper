import React, {useState} from 'react';

import styles from './CardColorsMockup.module.css';

const cards = [
  {id: 'TASK-101', color: '#4c9aff', col: 0},
  {id: 'TASK-99', color: '#36b37e', col: 1},
  {id: 'TASK-98', color: '#ff8b00', col: 1},
  {id: 'TASK-95', color: '#4c9aff', col: 1},
  {id: 'TASK-90', color: '#36b37e', col: 2},
];

const cols = ['To Do', 'In Progress', 'Done'];

export function CardColorsMockup(): React.ReactElement {
  const [fill, setFill] = useState(false);

  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.toggleBar}>
        <button
          type="button"
          className={`${styles.toggle} ${fill ? styles.toggleActive : ''}`}
          onClick={() => setFill(f => !f)}
          aria-label="Toggle fill whole card"
        >
          <div className={styles.toggleKnob} />
        </button>
        <span>Fill whole card</span>
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
              {cards.filter(c => c.col === colIdx).map(card => (
                <div
                  key={card.id}
                  className={`${styles.card} ${fill ? styles.fillCard : styles.stripOnly}`}
                  style={fill ? {borderColor: card.color} : undefined}
                >
                  <div
                    className={styles.cardStrip}
                    style={fill
                      ? {backgroundColor: card.color, opacity: 0.22}
                      : {backgroundColor: card.color}}
                  />
                  <div className={styles.cardContent}>{card.id}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
