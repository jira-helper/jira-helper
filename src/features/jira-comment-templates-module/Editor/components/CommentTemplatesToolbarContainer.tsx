import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { globalContainer, type Container } from 'dioma';
import type { Result } from 'ts-results';
import { WithDi, useDi } from 'src/infrastructure/di/diContext';
import { useGetTextsByLocale } from 'src/shared/texts';
import type {
  AddWatcherItemResult,
  AddWatchersResult,
  CommentEditorId,
  CommentTemplateId,
  CommentTemplatesNotificationState,
  InsertTemplateResult,
} from '../../types';
import type { JiraCommentTemplatesTextKey } from '../../texts';
import { commentTemplatesEditorModelToken, templatesStorageModelToken } from '../../tokens';
import { JIRA_COMMENT_TEMPLATES_TEXTS } from '../../texts';
import { CommentTemplatesNotification } from './CommentTemplatesNotification';
import { CommentTemplatesToolbar } from './CommentTemplatesToolbar';
import styles from './jira-comment-templates-editor.module.css';

const AUTO_HIDE_MS = 5000;

export type CommentTemplatesToolbarContainerProps = {
  commentEditorId: CommentEditorId;
  container?: Container;
  onOpenSettings?: () => void;
};

type CommentTemplatesToolbarContainerInnerProps = Omit<CommentTemplatesToolbarContainerProps, 'container'>;

type NotificationTexts = Record<JiraCommentTemplatesTextKey, string>;

function formatWatcherDetail(item: AddWatcherItemResult, texts: NotificationTexts): string {
  if (item.status === 'added') {
    return `${item.username}: ${texts.watcherAddedStatus}`;
  }

  return item.errorMessage
    ? `${item.username}: ${texts.watcherFailedStatus} (${item.errorMessage})`
    : `${item.username}: ${texts.watcherFailedStatus}`;
}

function buildNotificationFromWatchers(
  notificationId: string,
  watchersResult: AddWatchersResult,
  texts: NotificationTexts
): CommentTemplatesNotificationState | null {
  if (watchersResult.status === 'skipped' && watchersResult.reason === 'empty-watchers') {
    return null;
  }

  if (watchersResult.status === 'skipped' && watchersResult.reason === 'missing-issue-key') {
    return {
      id: notificationId,
      level: 'warning',
      message: texts.watchersSkippedMissingIssueKey,
    };
  }

  if (watchersResult.status === 'success') {
    return {
      id: notificationId,
      level: 'success',
      message: texts.watchersAdded,
      details: watchersResult.items.map(item => formatWatcherDetail(item, texts)),
    };
  }

  if (watchersResult.status === 'partial') {
    return {
      id: notificationId,
      level: 'warning',
      message: texts.watchersPartiallyAdded,
      details: watchersResult.items.map(item => formatWatcherDetail(item, texts)),
    };
  }

  return {
    id: notificationId,
    level: 'error',
    message: texts.watchersFailed,
    details: watchersResult.items.map(item => formatWatcherDetail(item, texts)),
  };
}

function buildNotificationFromInsertResult(
  notificationId: string,
  result: Result<InsertTemplateResult, Error>,
  texts: NotificationTexts
): CommentTemplatesNotificationState | null {
  if (result.err) {
    return {
      id: notificationId,
      level: 'error',
      message: texts.insertFailed,
      details: [result.val.message],
    };
  }

  if (!result.val.watchersResult) {
    return null;
  }

  return buildNotificationFromWatchers(notificationId, result.val.watchersResult, texts);
}

const CommentTemplatesToolbarContainerInner: React.FC<CommentTemplatesToolbarContainerInnerProps> = ({
  commentEditorId,
  onOpenSettings,
}) => {
  const container = useDi();
  const texts = useGetTextsByLocale(JIRA_COMMENT_TEMPLATES_TEXTS);
  const storageEntry = useMemo(() => container.inject(templatesStorageModelToken), [container]);
  const editorEntry = useMemo(() => container.inject(commentTemplatesEditorModelToken), [container]);
  const storageSnapshot = storageEntry.useModel();
  const editorSnapshot = editorEntry.useModel();
  const [notification, setNotification] = useState<CommentTemplatesNotificationState | null>(null);
  const autoHideTimer = useRef<number | null>(null);
  const notificationSeq = useRef(0);

  const clearAutoHideTimer = useCallback(() => {
    if (autoHideTimer.current == null) {
      return;
    }
    window.clearTimeout(autoHideTimer.current);
    autoHideTimer.current = null;
  }, []);

  useEffect(() => {
    if (storageSnapshot.loadState === 'initial') {
      void storageEntry.model.load();
    }
  }, [storageEntry, storageSnapshot.loadState]);

  useEffect(() => clearAutoHideTimer, [clearAutoHideTimer]);

  const showNotification = useCallback(
    (nextNotification: CommentTemplatesNotificationState | null) => {
      clearAutoHideTimer();
      setNotification(nextNotification);

      if (!nextNotification) {
        return;
      }

      autoHideTimer.current = window.setTimeout(() => {
        setNotification(current => (current?.id === nextNotification.id ? null : current));
        autoHideTimer.current = null;
      }, AUTO_HIDE_MS);
    },
    [clearAutoHideTimer]
  );

  const handleTemplateSelect = useCallback(
    async (templateId: CommentTemplateId) => {
      notificationSeq.current += 1;
      const insertSeq = notificationSeq.current;
      const notificationId = `${String(templateId)}-${insertSeq}`;
      const result = await editorEntry.model.insertTemplate({ commentEditorId, templateId });
      if (insertSeq !== notificationSeq.current) {
        return;
      }
      showNotification(buildNotificationFromInsertResult(notificationId, result, texts));
    },
    [commentEditorId, editorEntry, showNotification, texts]
  );

  const handleDismiss = useCallback(
    (notificationId: string) => {
      clearAutoHideTimer();
      setNotification(current => (current?.id === notificationId ? null : current));
    },
    [clearAutoHideTimer]
  );

  const isDisabled = Object.values(editorSnapshot.pendingTemplateIds).some(Boolean);

  return (
    <div className={styles.container}>
      <CommentTemplatesToolbar
        templates={storageSnapshot.templateSummaries}
        isDisabled={isDisabled}
        toolbarLabel={texts.toolbarLabel}
        toolbarAriaLabel={texts.settingsTitle}
        insertAriaLabelPrefix={texts.insertTemplateAriaLabelPrefix}
        manageButtonLabel={texts.manageTemplates}
        onTemplateSelect={handleTemplateSelect}
        onOpenSettings={onOpenSettings ?? (() => undefined)}
      />
      <div className={styles.notificationSlot}>
        <CommentTemplatesNotification
          notification={notification}
          dismissButtonLabel={texts.dismissNotification}
          onDismiss={handleDismiss}
        />
      </div>
    </div>
  );
};

export const CommentTemplatesToolbarContainer: React.FC<CommentTemplatesToolbarContainerProps> = ({
  container = globalContainer,
  commentEditorId,
  onOpenSettings,
}) => (
  <WithDi container={container}>
    <CommentTemplatesToolbarContainerInner commentEditorId={commentEditorId} onOpenSettings={onOpenSettings} />
  </WithDi>
);
