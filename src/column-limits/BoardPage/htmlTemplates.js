import styles from './styles.css';

/**
 * @param {number} amountOfGroupTasks
 * @param {string} groupLimit
 * @param {boolean} isCloud
 */
export const boardPageColumnHeaderBadge = ({ amountOfGroupTasks, groupLimit, isCloud = false }) => {
  // group limit is a string for some reason
  let badgeClasses = isCloud ? styles.limitColumnBadgeCloud : styles.limitColumnBadge;
  if (isCloud && Number(groupLimit) < amountOfGroupTasks) {
    badgeClasses += ` ${styles.limitColumnBadgeNotRespected}`;
  } else if (isCloud && Number(groupLimit) === amountOfGroupTasks) {
    badgeClasses += ` ${styles.limitColumnBadgeOnTheLimit}`;
  }

  const hintClasses = isCloud ? styles.limitColumnBadgeCloud__hint : styles.limitColumnBadge__hint;

  return `
    <span class="${badgeClasses}">
      ${amountOfGroupTasks}/${groupLimit}
      <span class="${hintClasses}">Issues per group / Max number of issues per group</span>
    </span>`;
};
