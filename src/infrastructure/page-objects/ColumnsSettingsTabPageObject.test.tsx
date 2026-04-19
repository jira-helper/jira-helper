import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { ColumnsSettingsTabPageObject } from './ColumnsSettingsTabPageObject';

describe('ColumnsSettingsTabPageObject', () => {
  let pageObject: ColumnsSettingsTabPageObject;
  let columnsConfig: HTMLElement;

  beforeEach(() => {
    columnsConfig = document.createElement('div');
    columnsConfig.id = 'ghx-config-columns';
    const lastChild = document.createElement('div');
    lastChild.className = 'last-child';
    columnsConfig.appendChild(lastChild);
    document.body.appendChild(columnsConfig);

    pageObject = new ColumnsSettingsTabPageObject();
  });

  afterEach(() => {
    pageObject.destroy();
    document.body.innerHTML = '';
  });

  describe('registerButton', () => {
    it('should create buttons container', () => {
      act(() => {
        pageObject.registerButton('test', React.createElement('button', null, 'Test'));
      });

      const container = document.querySelector('[data-jh-columns-buttons]');
      expect(container).not.toBeNull();
    });

    it('should render component inside container', () => {
      act(() => {
        pageObject.registerButton('test', React.createElement('button', { 'data-testid': 'btn' }, 'Test'));
      });

      const button = document.querySelector('[data-testid="btn"]');
      expect(button).not.toBeNull();
    });

    it('should render multiple buttons', () => {
      act(() => {
        pageObject.registerButton('btn1', React.createElement('button', { 'data-testid': 'btn1' }, 'Button 1'));
        pageObject.registerButton('btn2', React.createElement('button', { 'data-testid': 'btn2' }, 'Button 2'));
      });

      expect(document.querySelector('[data-testid="btn1"]')).not.toBeNull();
      expect(document.querySelector('[data-testid="btn2"]')).not.toBeNull();
    });

    it('should return cleanup function that removes button', () => {
      let cleanup: () => void;

      act(() => {
        cleanup = pageObject.registerButton('test', React.createElement('button', { 'data-testid': 'test' }, 'Test'));
      });

      expect(document.querySelector('[data-testid="test"]')).not.toBeNull();

      act(() => {
        cleanup();
      });

      expect(document.querySelector('[data-testid="test"]')).toBeNull();
    });

    it('should keep other buttons when one is unregistered', () => {
      let cleanup1: () => void;

      act(() => {
        cleanup1 = pageObject.registerButton('btn1', React.createElement('button', { 'data-testid': 'btn1' }, 'B1'));
        pageObject.registerButton('btn2', React.createElement('button', { 'data-testid': 'btn2' }, 'B2'));
      });

      act(() => {
        cleanup1();
      });

      expect(document.querySelector('[data-testid="btn1"]')).toBeNull();
      expect(document.querySelector('[data-testid="btn2"]')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('should remove container', () => {
      act(() => {
        pageObject.registerButton('test', React.createElement('button', null, 'Test'));
      });

      expect(document.querySelector('[data-jh-columns-buttons]')).not.toBeNull();

      act(() => {
        pageObject.destroy();
      });

      expect(document.querySelector('[data-jh-columns-buttons]')).toBeNull();
    });

    it('should be safe to call multiple times', () => {
      pageObject.destroy();
      pageObject.destroy();
    });
  });
});
