import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { act } from '@testing-library/react';
import { FieldLimitsBoardPageObject } from './FieldLimitsBoardPageObject';

describe('FieldLimitsBoardPageObject', () => {
  let pageObject: FieldLimitsBoardPageObject;

  beforeEach(() => {
    pageObject = new FieldLimitsBoardPageObject();
    document.body.innerHTML = '';
  });

  describe('selectors', () => {
    it('should have correct selectors', () => {
      expect(pageObject.selectors.extraField).toBe('.ghx-extra-field');
      expect(pageObject.selectors.subnavTitle).toBe('#subnav-title');
    });
  });

  describe('getFieldNameFromExtraField', () => {
    it('should extract field name from data-tooltip', () => {
      const el = document.createElement('div');
      el.setAttribute('data-tooltip', 'Priority: High');
      expect(pageObject.getFieldNameFromExtraField(el)).toBe('Priority');
    });

    it('should extract field name from title attribute', () => {
      const el = document.createElement('div');
      el.setAttribute('title', 'Team: Frontend');
      expect(pageObject.getFieldNameFromExtraField(el)).toBe('Team');
    });

    it('should prefer data-tooltip over title', () => {
      const el = document.createElement('div');
      el.setAttribute('data-tooltip', 'Priority: High');
      el.setAttribute('title', 'Team: Frontend');
      expect(pageObject.getFieldNameFromExtraField(el)).toBe('Priority');
    });

    it('should return null when no attribute', () => {
      const el = document.createElement('div');
      expect(pageObject.getFieldNameFromExtraField(el)).toBeNull();
    });
  });

  describe('getExtraFieldTexts', () => {
    it('should extract texts from child nodes', () => {
      const el = document.createElement('div');
      const span1 = document.createElement('span');
      span1.textContent = 'Pro, Team';
      const span2 = document.createElement('span');
      span2.textContent = 'Bug';
      el.appendChild(span1);
      el.appendChild(span2);

      const texts = pageObject.getExtraFieldTexts(el);
      expect(texts).toEqual(['Pro, Team', 'Bug']);
    });

    it('should return empty array for empty element', () => {
      const el = document.createElement('div');
      expect(pageObject.getExtraFieldTexts(el)).toEqual([]);
    });
  });

  describe('colorCard', () => {
    it('should set background color', () => {
      const el = document.createElement('div');
      pageObject.colorCard(el, '#ff0000');
      expect(['#ff0000', 'rgb(255, 0, 0)']).toContain(el.style.backgroundColor);
    });
  });

  describe('resetCardColor', () => {
    it('should clear background color', () => {
      const el = document.createElement('div');
      el.style.backgroundColor = '#ff0000';
      pageObject.resetCardColor(el);
      expect(el.style.backgroundColor).toBe('');
    });
  });

  describe('insertSubnavComponent', () => {
    it('should insert React component into subnav', async () => {
      const subnavTitle = document.createElement('div');
      subnavTitle.id = 'subnav-title';
      document.body.appendChild(subnavTitle);

      await act(async () => {
        pageObject.insertSubnavComponent(React.createElement('span', null, 'Test'), 'field-limits');
      });

      const wrapper = subnavTitle.querySelector('[data-jh-field-limits="field-limits"]');
      expect(wrapper).toBeTruthy();
      expect(wrapper?.textContent).toBe('Test');
    });

    it('should do nothing when subnav-title not found', () => {
      pageObject.insertSubnavComponent(React.createElement('span', null, 'Test'), 'field-limits');
      expect(document.body.querySelector('[data-jh-field-limits="field-limits"]')).toBeNull();
    });
  });

  describe('removeSubnavComponent', () => {
    it('should remove previously inserted component', () => {
      const subnavTitle = document.createElement('div');
      subnavTitle.id = 'subnav-title';
      document.body.appendChild(subnavTitle);

      pageObject.insertSubnavComponent(React.createElement('span', null, 'Test'), 'field-limits');
      expect(subnavTitle.querySelector('[data-jh-field-limits="field-limits"]')).toBeTruthy();

      pageObject.removeSubnavComponent('field-limits');
      expect(subnavTitle.querySelector('[data-jh-field-limits="field-limits"]')).toBeNull();
    });

    it('should be idempotent when called twice', () => {
      const subnavTitle = document.createElement('div');
      subnavTitle.id = 'subnav-title';
      document.body.appendChild(subnavTitle);

      pageObject.insertSubnavComponent(React.createElement('span', null, 'Test'), 'field-limits');
      pageObject.removeSubnavComponent('field-limits');
      expect(() => pageObject.removeSubnavComponent('field-limits')).not.toThrow();
    });
  });
});
