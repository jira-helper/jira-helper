import React from 'react';
import { Button } from 'antd';

import type { CommentTemplateId, CommentTemplateSummary } from '../../types';
import { resolveCommentTemplateButtonColors } from '../../utils/resolveCommentTemplateButtonColors';

import styles from './comment-templates-toolbar.module.css';

export type TemplateButtonProps = {
  template: CommentTemplateSummary;
  isDisabled: boolean;
  insertAriaLabelPrefix: string;
  onSelect: (templateId: CommentTemplateId) => void;
};

/**
 * Single template insert control: visible label, left accent from template color, native button semantics.
 */
export const TemplateButton: React.FC<TemplateButtonProps> = ({
  template,
  isDisabled,
  insertAriaLabelPrefix,
  onSelect,
}) => {
  const accessibleLabel = `${insertAriaLabelPrefix} ${template.label}`;
  const { background: accentColor, foreground: accentForeground } = resolveCommentTemplateButtonColors(template.color);

  return (
    <Button
      htmlType="button"
      className={styles.templateButton}
      // eslint-disable-next-line local/no-inline-styles -- resolved template accent + readable fg: CSS vars (comment-templates-toolbar.module.css)
      style={
        {
          '--jh-template-accent': accentColor,
          '--jh-template-accent-bg': accentColor,
          '--jh-template-accent-fg': accentForeground,
          backgroundColor: accentColor,
          borderColor: accentColor,
          color: accentForeground,
        } as React.CSSProperties
      }
      disabled={isDisabled}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      onClick={() => onSelect(template.id)}
    >
      <span className={styles.templateButtonLabel}>{template.label}</span>
    </Button>
  );
};
