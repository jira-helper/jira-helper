import React, { useCallback, useRef } from 'react';
import { Button } from 'antd';

import type { CommentTemplateId, CommentTemplateSummary } from '../../types';

import styles from './comment-templates-toolbar.module.css';
import { TemplateButton } from './TemplateButton';

export type CommentTemplatesToolbarProps = {
  templates: CommentTemplateSummary[];
  isDisabled: boolean;
  toolbarLabel: string;
  toolbarAriaLabel: string;
  insertAriaLabelPrefix: string;
  manageButtonLabel: string;
  onTemplateSelect: (templateId: CommentTemplateId) => void;
  onOpenSettings: () => void;
};

const focusableToolbarButtonSelector = 'button:not(:disabled)';

/**
 * Toolbar for quick-insert template buttons plus settings entry.
 *
 * When `isDisabled` is true, template insert buttons are disabled so `onTemplateSelect` cannot fire.
 * The manage/settings control stays enabled so the user can open configuration (see TASK-88).
 */
export const CommentTemplatesToolbar: React.FC<CommentTemplatesToolbarProps> = ({
  templates,
  isDisabled,
  toolbarLabel,
  toolbarAriaLabel,
  insertAriaLabelPrefix,
  manageButtonLabel,
  onTemplateSelect,
  onOpenSettings,
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);

  const focusButtonAt = useCallback((index: number) => {
    const buttons = Array.from(
      toolbarRef.current?.querySelectorAll<HTMLButtonElement>(focusableToolbarButtonSelector) ?? []
    );
    buttons[index]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        return;
      }

      const buttons = Array.from(
        toolbarRef.current?.querySelectorAll<HTMLButtonElement>(focusableToolbarButtonSelector) ?? []
      );
      if (buttons.length === 0) {
        return;
      }

      const currentIndex = buttons.findIndex(button => button === event.target);
      if (currentIndex === -1) {
        return;
      }

      event.preventDefault();

      if (event.key === 'Home') {
        focusButtonAt(0);
        return;
      }

      if (event.key === 'End') {
        focusButtonAt(buttons.length - 1);
        return;
      }

      const direction = event.key === 'ArrowRight' ? 1 : -1;
      focusButtonAt((currentIndex + direction + buttons.length) % buttons.length);
    },
    [focusButtonAt]
  );

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label={toolbarAriaLabel}
      className={styles.toolbar}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.toolbarLabel}>{toolbarLabel}</span>
      <div className={styles.templateList}>
        {templates.map(template => (
          <TemplateButton
            key={template.id}
            template={template}
            isDisabled={isDisabled}
            insertAriaLabelPrefix={insertAriaLabelPrefix}
            onSelect={onTemplateSelect}
          />
        ))}
      </div>
      <div className={styles.manageArea}>
        <Button htmlType="button" className={styles.manageButton} onClick={() => onOpenSettings()}>
          {manageButtonLabel}
        </Button>
      </div>
    </div>
  );
};
