/**
 * Creates or returns existing shared container for Settings Page buttons.
 * All Settings Page buttons (column-limits, person-limits, wiplimit-on-cells)
 * should be inserted into this container to display them in a horizontal row.
 *
 * @returns The shared buttons container element
 */
export function getOrCreateButtonsContainer(): HTMLElement {
  const existingContainer = document.getElementById('jh-settings-buttons-container');
  if (existingContainer) {
    return existingContainer;
  }

  const lastChild = document.querySelector('#ghx-config-columns > *:last-child');
  if (!lastChild) {
    throw new Error('Cannot find #ghx-config-columns > *:last-child element');
  }

  const container = document.createElement('div');
  container.id = 'jh-settings-buttons-container';
  container.style.display = 'flex';
  container.style.gap = '8px';
  container.style.marginBottom = '10px';

  lastChild.insertAdjacentElement('beforebegin', container);

  return container;
}
