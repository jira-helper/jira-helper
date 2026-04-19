export class CardColorsSettingsTabPageObject {
  static selectors = {
    colorsTable: '#ghx-card-color-table-form',
  };

  createSpaceBeforeColorsTable(): Element | null {
    const el = document.querySelector(CardColorsSettingsTabPageObject.selectors.colorsTable);
    if (!el) {
      return null;
    }
    const div = document.createElement('div');
    const parent = el.parentNode;
    if (!parent) {
      return null;
    }
    parent?.insertBefore(div, el);
    return div;
  }
}
