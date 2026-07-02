import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AvatarBadge } from './AvatarBadge';

describe('AvatarBadge', () => {
  it('uses displayName for image title and alt while preserving account id for identity', () => {
    render(
      <AvatarBadge
        avatar="https://avatar.example/xcredo.png"
        personName="712020:account-id"
        displayName="xCredo"
        limitId={1}
        currentCount={2}
        limit={1}
        isActive={false}
        onClick={vi.fn()}
      />
    );

    const button = screen.getByRole('button');
    const image = screen.getByRole('img');

    expect(button).toHaveAttribute('data-person-name', '712020:account-id');
    expect(image).toHaveAttribute('title', 'xCredo');
    expect(image).toHaveAttribute('alt', 'xCredo');
    expect(image).toHaveAttribute('src', 'https://avatar.example/xcredo.png');
  });
});
