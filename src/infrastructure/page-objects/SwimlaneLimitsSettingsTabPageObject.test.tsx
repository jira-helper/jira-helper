import React from 'react';
import { act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SwimlaneLimitsSettingsTabPageObject } from './SwimlaneLimitsSettingsTabPageObject';

describe('SwimlaneLimitsSettingsTabPageObject', () => {
  let pageObject: SwimlaneLimitsSettingsTabPageObject;

  beforeEach(() => {
    pageObject = new SwimlaneLimitsSettingsTabPageObject();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('isCustomSwimlaneStrategy', () => {
    it('should return true when select value is "custom"', () => {
      document.body.innerHTML = `
        <select id="ghx-swimlanestrategy-select">
          <option value="custom" selected>Custom</option>
        </select>
      `;
      expect(pageObject.isCustomSwimlaneStrategy()).toBe(true);
    });

    it('should return false when select value is not "custom"', () => {
      document.body.innerHTML = `
        <select id="ghx-swimlanestrategy-select">
          <option value="none" selected>None</option>
        </select>
      `;
      expect(pageObject.isCustomSwimlaneStrategy()).toBe(false);
    });

    it('should return false when select does not exist', () => {
      expect(pageObject.isCustomSwimlaneStrategy()).toBe(false);
    });
  });

  describe('getConfigContainer', () => {
    it('should return container when exists', () => {
      document.body.innerHTML = '<div id="ghx-swimlane-strategy-config"></div>';
      expect(pageObject.getConfigContainer()).not.toBeNull();
    });

    it('should return null when container does not exist', () => {
      expect(pageObject.getConfigContainer()).toBeNull();
    });
  });

  describe('insertSettingsButton', () => {
    it('should insert button before config container', () => {
      document.body.innerHTML = '<div id="ghx-swimlane-strategy-config">Config</div>';
      const component = <span>Settings</span>;

      act(() => {
        pageObject.insertSettingsButton(component);
      });

      const wrapper = document.querySelector('[data-jh-swimlane-settings]');
      expect(wrapper).not.toBeNull();
      expect(wrapper?.nextElementSibling?.id).toBe('ghx-swimlane-strategy-config');
      expect(wrapper?.textContent).toContain('Settings');
    });

    it('should not insert duplicate button', () => {
      document.body.innerHTML = '<div id="ghx-swimlane-strategy-config">Config</div>';
      const component = <span>Settings</span>;

      act(() => {
        pageObject.insertSettingsButton(component);
        pageObject.insertSettingsButton(component);
      });

      const wrappers = document.querySelectorAll('[data-jh-swimlane-settings]');
      expect(wrappers).toHaveLength(1);
    });

    it('should do nothing when config container does not exist', () => {
      const component = <span>Settings</span>;

      pageObject.insertSettingsButton(component);

      expect(document.querySelector('[data-jh-swimlane-settings]')).toBeNull();
    });
  });

  describe('removeSettingsButton', () => {
    it('should remove button from DOM', () => {
      document.body.innerHTML = '<div data-jh-swimlane-settings="true"></div>';
      pageObject.removeSettingsButton();
      expect(document.querySelector('[data-jh-swimlane-settings]')).toBeNull();
    });

    it('should do nothing if button does not exist', () => {
      expect(() => pageObject.removeSettingsButton()).not.toThrow();
    });
  });
});
