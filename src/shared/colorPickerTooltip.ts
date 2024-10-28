/* eslint-disable no-underscore-dangle */
// @ts-expect-error
import ColorPicker from 'simple-color-picker';
import noop from '@tinkoff/utils/function/noop';
import { colorPickerTooltipTemplate } from './htmlTemplates';
import styles from './styles.module.css';

/*
 * Usage:
 * 1. Run html() which returns html-string and append to required block
 * 2. Run init()
 * */
export class ColorPickerTooltip {
  static ids = {
    colorPickerTooltip: 'jh-wip-limits-color-picker-tooltip',
    colorPicker: 'jh-color-picker-inner-tooltip',
    colorPickerResult: 'jh-color-picker-inner-tooltip-result',
    okBtn: 'jh-color-picker-ok-btn',
    closeBtn: 'jh-color-picker-cancel-btn',
  };

  // Define instance properties with proper types
  private colorPicker: ColorPicker;

  private onClose: () => void;

  private onOk: (color: string, dataId: string) => void;

  private addEventListener: (element: HTMLElement, event: string, handler: () => any) => void;

  private dataId: string | null;

  private attrNameOfDataId: string | null;

  private hostElement: HTMLElement | null = null;

  private tooltip: HTMLElement | null = null;

  private pickerResultElem: HTMLElement | null = null;

  constructor({
    onClose = noop,
    onOk = (/* hexStr */) => {},
    addEventListener,
  }: {
    onClose?: () => void;
    onOk?: (color: string, dataId: string) => void;
    addEventListener: (element: HTMLElement, event: string, handler: EventListenerOrEventListenerObject) => void;
  }) {
    this.colorPicker = new ColorPicker({
      color: '#FF0000',
      background: '#454545',
      width: 200,
      height: 200,
    });
    this.onClose = onClose;
    this.onOk = onOk;
    this.addEventListener = addEventListener;
    this.dataId = null;
    this.attrNameOfDataId = null;
  }

  html(): string {
    return colorPickerTooltipTemplate({
      tooltipClass: styles.tooltip,
      id: ColorPickerTooltip.ids.colorPickerTooltip,
      colorPickerId: ColorPickerTooltip.ids.colorPicker,
      colorPickerResultId: ColorPickerTooltip.ids.colorPickerResult,
      btnWrpClass: styles.tooltipButtonsWrp,
      colorPickerResultClass: styles.tooltipResult,
      okBtnId: ColorPickerTooltip.ids.okBtn,
      closeBtnId: ColorPickerTooltip.ids.closeBtn,
    });
  }

  init(hostElement: HTMLElement, attrDataId: string): void {
    this.hostElement = hostElement;
    this.attrNameOfDataId = attrDataId;

    if (!(this.hostElement instanceof HTMLElement)) {
      throw new Error('host element for colorpicker is not DOM element');
    }
    if (!this.attrNameOfDataId) {
      throw new Error('attribute name of data id for colorpicker is empty');
    }

    this.hostElement.insertAdjacentHTML('beforeend', this.html());

    this.addEventListener(hostElement, 'scroll', () => {
      this.hideTooltip();
    });

    this.tooltip = document.getElementById(ColorPickerTooltip.ids.colorPickerTooltip);
    this.pickerResultElem = document.getElementById(ColorPickerTooltip.ids.colorPickerResult);

    this.colorPicker.appendTo(`#${ColorPickerTooltip.ids.colorPicker}`);
    this.colorPicker.onChange((hexColorString: string) => {
      this.pickerResultElem!.style.background = hexColorString;
    });

    this._initBtnHandlers();
  }

  get isVisible(): boolean {
    return this.tooltip?.style.visibility !== 'hidden';
  }

  hideTooltip(): void {
    if (this.isVisible && this.tooltip) {
      this.tooltip.style.visibility = 'hidden';
      // this line fixed by gpt
      // prev version this.colorPickerGroupId = null;
      this.dataId = null;
    }
    this.onClose();
  }

  showTooltip({ target }: { target: HTMLElement }): void {
    if (!target.hasAttribute(this.attrNameOfDataId!)) return;
    if (!this.tooltip) return;

    this.dataId = target.getAttribute(this.attrNameOfDataId!);
    const position = this.getTooltipPosition(target);

    this.tooltip.style.visibility = 'visible';
    this.tooltip.style.top = `${position}px`;
  }

  getTooltipPosition(target: HTMLElement): number {
    const tPosition = target.getBoundingClientRect();
    const hPosition = this.hostElement!.getBoundingClientRect();
    return tPosition.top - hPosition.top;
  }

  private _save = (): void => {
    if (this.dataId !== null) {
      this.onOk(this.colorPicker.getColor(), this.dataId);
    }
    this.hideTooltip();
  };

  private _cancel = (): void => {
    this.hideTooltip();
  };

  private _initBtnHandlers(): void {
    const okBtn = document.getElementById(ColorPickerTooltip.ids.okBtn);
    const closeBtn = document.getElementById(ColorPickerTooltip.ids.closeBtn);

    if (okBtn) {
      this.addEventListener(okBtn, 'click', this._save);
    }
    if (closeBtn) {
      this.addEventListener(closeBtn, 'click', this._cancel);
    }
  }
}
