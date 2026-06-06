import { describe, it, expect, beforeEach } from 'vitest';

describe('BoardPagePageObject', () => {
  function createWrapper(groupId = '1', groupName = 'test'): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-jh-group-label', groupId);
    const innerDiv = document.createElement('div');
    innerDiv.style.position = 'relative';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'groupName';
    nameSpan.textContent = groupName;
    innerDiv.appendChild(nameSpan);
    wrapper.appendChild(innerDiv);
    return wrapper;
  }

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('creates popup in body with correct content on mouseenter', async () => {
    const mod = await import('../BoardPagePageObject');
    const wrapper = createWrapper('42', 'my-group');
    document.body.appendChild(wrapper);

    mod.BoardPagePageObject._attachPopupListener(wrapper);
    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));

    const popup = document.getElementById('jh-popup-42');
    expect(popup).toBeTruthy();
    expect(popup!.tagName).toBe('SPAN');
    expect(popup!.textContent).toBe('my-group');
  });

  it('popup hidden by default', async () => {
    const mod = await import('../BoardPagePageObject');
    const wrapper = createWrapper('7', 'hidden-group');
    document.body.appendChild(wrapper);

    mod.BoardPagePageObject._attachPopupListener(wrapper);
    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));

    const popup = document.getElementById('jh-popup-7')!;
    expect(popup.style.display).toBe('block');
  });

  it('shows and positions popup on mouseenter', async () => {
    const mod = await import('../BoardPagePageObject');
    const wrapper = createWrapper('5', 'pos-group');
    document.body.appendChild(wrapper);
    const origRect = wrapper.getBoundingClientRect;
    wrapper.getBoundingClientRect = () => ({ bottom: 120, left: 60, top: 90, right: 300, width: 240, height: 30 } as DOMRect);

    mod.BoardPagePageObject._attachPopupListener(wrapper);
    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));

    const popup = document.getElementById('jh-popup-5')!;
    expect(popup.style.display).toBe('block');
    expect(popup.style.top).toBe('124px');
    expect(popup.style.left).toBe('60px');

    wrapper.getBoundingClientRect = origRect;
  });

  it('hides popup on mouseleave', async () => {
    const mod = await import('../BoardPagePageObject');
    const wrapper = createWrapper('9', 'hide-group');
    document.body.appendChild(wrapper);

    mod.BoardPagePageObject._attachPopupListener(wrapper);
    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));

    expect(document.getElementById('jh-popup-9')!.style.display).toBe('block');

    wrapper.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
    expect(document.getElementById('jh-popup-9')!.style.display).toBe('none');
  });

  it('recreates popup if removed from DOM', async () => {
    const mod = await import('../BoardPagePageObject');
    const wrapper = createWrapper('3', 'recreate');
    document.body.appendChild(wrapper);

    mod.BoardPagePageObject._attachPopupListener(wrapper);
    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    const popup = document.getElementById('jh-popup-3')!;
    popup.remove();

    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));

    const newPopup = document.getElementById('jh-popup-3');
    expect(newPopup).toBeTruthy();
    expect(newPopup!.style.display).toBe('block');
  });
});
