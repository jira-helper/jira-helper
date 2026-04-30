import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toCommentTemplateId } from '../../types';
import { resolveCommentTemplateButtonColors } from '../../utils/resolveCommentTemplateButtonColors';
import { CommentTemplatesToolbar } from './CommentTemplatesToolbar';

const t1 = {
  id: toCommentTemplateId('tpl-a'),
  label: 'Alpha label',
  color: '#ff00aa',
};
const t2 = {
  id: toCommentTemplateId('tpl-b'),
  label: 'Beta label',
  color: '#00aa55',
};

describe('CommentTemplatesToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders each template label and exposes color as accent custom property', () => {
    render(
      <CommentTemplatesToolbar
        templates={[t1, t2]}
        isDisabled={false}
        toolbarLabel="Templates:"
        toolbarAriaLabel="Comment templates"
        insertAriaLabelPrefix="Insert comment template:"
        manageButtonLabel="Manage templates"
        onTemplateSelect={vi.fn()}
        onOpenSettings={vi.fn()}
      />
    );

    expect(screen.getByRole('toolbar', { name: 'Comment templates' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Insert comment template: Alpha label' })).toHaveTextContent(
      'Alpha label'
    );
    expect(screen.getByRole('button', { name: 'Insert comment template: Beta label' })).toHaveTextContent('Beta label');

    const alphaBtn = screen.getByRole('button', { name: 'Insert comment template: Alpha label' });
    const betaBtn = screen.getByRole('button', { name: 'Insert comment template: Beta label' });
    const alphaColors = resolveCommentTemplateButtonColors(t1.color);
    const betaColors = resolveCommentTemplateButtonColors(t2.color);
    expect(alphaBtn.style.getPropertyValue('--jh-template-accent').trim()).toBe(alphaColors.background);
    expect(betaBtn.style.getPropertyValue('--jh-template-accent').trim()).toBe(betaColors.background);
    expect(alphaBtn.style.getPropertyValue('--jh-template-accent-fg').trim()).toBe(alphaColors.foreground);
    expect(betaBtn.style.getPropertyValue('--jh-template-accent-fg').trim()).toBe(betaColors.foreground);
    expect(alphaBtn).toHaveStyle({ backgroundColor: alphaColors.background, color: alphaColors.foreground });
    expect(betaBtn).toHaveStyle({ backgroundColor: betaColors.background, color: betaColors.foreground });
  });

  it('uses fallback accent CSS value when stored color is not a valid hex', () => {
    const bad = { ...t1, color: 'not-a-hex' };
    render(
      <CommentTemplatesToolbar
        templates={[bad]}
        isDisabled={false}
        toolbarLabel="Templates:"
        toolbarAriaLabel="Comment templates"
        insertAriaLabelPrefix="Insert comment template:"
        manageButtonLabel="Manage templates"
        onTemplateSelect={vi.fn()}
        onOpenSettings={vi.fn()}
      />
    );

    const btn = screen.getByRole('button', { name: 'Insert comment template: Alpha label' });
    const colors = resolveCommentTemplateButtonColors(bad.color);
    expect(btn.style.getPropertyValue('--jh-template-accent').trim()).toBe(colors.background);
    expect(btn.style.getPropertyValue('--jh-template-accent-fg').trim()).toBe(colors.foreground);
  });

  it('disables template buttons and blocks onTemplateSelect when isDisabled', async () => {
    const user = userEvent.setup();
    const onTemplateSelect = vi.fn();
    render(
      <CommentTemplatesToolbar
        templates={[t1]}
        isDisabled
        toolbarLabel="Templates:"
        toolbarAriaLabel="Comment templates"
        insertAriaLabelPrefix="Insert comment template:"
        manageButtonLabel="Settings"
        onTemplateSelect={onTemplateSelect}
        onOpenSettings={vi.fn()}
      />
    );

    const insertBtn = screen.getByRole('button', { name: 'Insert comment template: Alpha label' });
    expect(insertBtn).toBeDisabled();

    await user.click(insertBtn);
    expect(onTemplateSelect).not.toHaveBeenCalled();
  });

  it('calls onTemplateSelect with template id when a template button is clicked', async () => {
    const user = userEvent.setup();
    const onTemplateSelect = vi.fn();
    render(
      <CommentTemplatesToolbar
        templates={[t1, t2]}
        isDisabled={false}
        toolbarLabel="Templates:"
        toolbarAriaLabel="Comment templates"
        insertAriaLabelPrefix="Insert comment template:"
        manageButtonLabel="Manage"
        onTemplateSelect={onTemplateSelect}
        onOpenSettings={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Insert comment template: Beta label' }));
    expect(onTemplateSelect).toHaveBeenCalledTimes(1);
    expect(onTemplateSelect).toHaveBeenCalledWith(t2.id);
  });

  it('calls onOpenSettings from manage button and does not trigger template select', async () => {
    const user = userEvent.setup();
    const onTemplateSelect = vi.fn();
    const onOpenSettings = vi.fn();
    render(
      <CommentTemplatesToolbar
        templates={[t1]}
        isDisabled={false}
        toolbarLabel="Templates:"
        toolbarAriaLabel="Comment templates"
        insertAriaLabelPrefix="Insert comment template:"
        manageButtonLabel="Open comment template settings"
        onTemplateSelect={onTemplateSelect}
        onOpenSettings={onOpenSettings}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open comment template settings' }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onTemplateSelect).not.toHaveBeenCalled();
  });

  it('still renders manage button when there are no templates', () => {
    const onOpenSettings = vi.fn();
    render(
      <CommentTemplatesToolbar
        templates={[]}
        isDisabled={false}
        toolbarLabel="Templates:"
        toolbarAriaLabel="Comment templates"
        insertAriaLabelPrefix="Insert comment template:"
        manageButtonLabel="Templates…"
        onTemplateSelect={vi.fn()}
        onOpenSettings={onOpenSettings}
      />
    );

    expect(screen.queryByRole('button', { name: /Insert comment template:/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Templates…' })).toBeInTheDocument();
  });

  it('keeps manage enabled when toolbar is disabled so settings stay reachable', async () => {
    const user = userEvent.setup();
    const onOpenSettings = vi.fn();
    render(
      <CommentTemplatesToolbar
        templates={[t1]}
        isDisabled
        toolbarLabel="Templates:"
        toolbarAriaLabel="Comment templates"
        insertAriaLabelPrefix="Insert comment template:"
        manageButtonLabel="Configure"
        onTemplateSelect={vi.fn()}
        onOpenSettings={onOpenSettings}
      />
    );

    const manage = screen.getByRole('button', { name: 'Configure' });
    expect(manage).not.toBeDisabled();
    await user.click(manage);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('moves focus between enabled toolbar buttons with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <CommentTemplatesToolbar
        templates={[t1, t2]}
        isDisabled={false}
        toolbarLabel="Templates:"
        toolbarAriaLabel="Comment templates"
        insertAriaLabelPrefix="Insert comment template:"
        manageButtonLabel="Manage"
        onTemplateSelect={vi.fn()}
        onOpenSettings={vi.fn()}
      />
    );

    const alpha = screen.getByRole('button', { name: 'Insert comment template: Alpha label' });
    const beta = screen.getByRole('button', { name: 'Insert comment template: Beta label' });
    const manage = screen.getByRole('button', { name: 'Manage' });

    alpha.focus();
    await user.keyboard('{ArrowRight}');
    expect(beta).toHaveFocus();

    await user.keyboard('{End}');
    expect(manage).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(alpha).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(manage).toHaveFocus();
  });
});
