import React from 'react';

import type { CommentTemplatesNotificationLevel, CommentTemplatesNotificationState } from '../../types';

import styles from './comment-templates-notification.module.css';

export type CommentTemplatesNotificationProps = {
  notification: CommentTemplatesNotificationState | null;
  dismissButtonLabel: string;
  onDismiss: (notificationId: string) => void;
};

const levelClassNameByLevel: Record<CommentTemplatesNotificationLevel, string> = {
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
};

export const CommentTemplatesNotification: React.FC<CommentTemplatesNotificationProps> = ({
  notification,
  dismissButtonLabel,
  onDismiss,
}) => {
  if (!notification) {
    return null;
  }

  const hasDetails = notification.details && notification.details.length > 0;
  const role = notification.level === 'error' ? 'alert' : 'status';

  return (
    <section
      role={role}
      aria-live={notification.level === 'error' ? 'assertive' : 'polite'}
      className={`${styles.notification} ${levelClassNameByLevel[notification.level]}`}
      data-level={notification.level}
    >
      <div className={styles.content}>
        <p className={styles.message}>{notification.message}</p>
        {hasDetails && (
          <ul className={styles.details}>
            {notification.details?.map((detail, index) => <li key={`${detail}-${index}`}>{detail}</li>)}
          </ul>
        )}
      </div>
      <button
        type="button"
        className={styles.dismissButton}
        aria-label={dismissButtonLabel}
        onClick={() => onDismiss(notification.id)}
      >
        x
      </button>
    </section>
  );
};
