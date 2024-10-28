const noopWithCallback = (cb: () => void): void => cb();

interface PopupProps {
  title?: string;
  initialContentInnerHTML?: string;
  onCancel?: (unmountCallback: () => void) => void;
  onConfirm?: (unmountCallback: () => void) => void;
  okButtonText?: string;
  size?: 'large' | 'medium' | 'small';
}

export class Popup {
  private isOpened: boolean;

  private initialProps: PopupProps;

  private popupIdentifiers: {
    wrapperId: string;
    contentWrapperId: string;
    confirmBtnId: string;
    cancelBtnId: string;
  };

  private htmlElement: HTMLElement | null;

  public contentBlock: HTMLElement | null;

  private confirmBtn: HTMLElement | null;

  private cancelBtn: HTMLElement | null;

  constructor({
    title = '',
    initialContentInnerHTML = '',
    onCancel = noopWithCallback,
    onConfirm = noopWithCallback,
    okButtonText = 'Ok',
    size = 'medium', // large, medium, small
  }: PopupProps) {
    this.isOpened = false;

    this.initialProps = {
      title,
      initialContentInnerHTML,
      onCancel,
      onConfirm,
      okButtonText,
      size,
    };

    this.popupIdentifiers = {
      wrapperId: 'jh-popup-wrapper',
      contentWrapperId: 'jh-popup-content',
      confirmBtnId: 'jh-popup-confirm-btn',
      cancelBtnId: 'jh-popup-cancel-btn',
    };

    this.htmlElement = null;
    this.contentBlock = null;
    this.confirmBtn = null;
    this.cancelBtn = null;
  }

  // Event handler for cancel button
  onClose = (): void => {
    this.initialProps.onCancel?.(this.unmount);
  };

  // Event handler for confirm button
  onOk = (): void => {
    this.initialProps.onConfirm?.(this.unmount);
  };

  // Generates the HTML for the popup
  html(): string {
    return `<section open id="${this.popupIdentifiers.wrapperId}" class="aui-dialog2 aui-dialog2-${this.initialProps.size} aui-layer" role="dialog" data-aui-focus="false" data-aui-blanketed="true" aria-hidden="false" style="z-index: 3000;">
      <header class="aui-dialog2-header">
          <h2 class="aui-dialog2-header-main">${this.initialProps.title}</h2>
      </header>
      <div class="aui-dialog2-content" id="${this.popupIdentifiers.contentWrapperId}"></div>
      <footer class="aui-dialog2-footer">
          <div class="aui-dialog2-footer-actions">
                <button id="${this.popupIdentifiers.confirmBtnId}" class="aui-button aui-button-primary">${this.initialProps.okButtonText}</button>
                <button id="${this.popupIdentifiers.cancelBtnId}" class="aui-button">Cancel</button>
            </div>
      </footer>
    </section>
    `;
  }

  // Attaches event handlers to buttons
  attachButtonHandlers(): void {
    if (!this.confirmBtn || !this.cancelBtn) return;

    this.confirmBtn.addEventListener('click', this.onOk);
    this.cancelBtn.addEventListener('click', this.onClose);
  }

  // Removes event handlers from buttons
  deattachButtonHandlers(): void {
    if (!this.confirmBtn || !this.cancelBtn) return;

    this.confirmBtn.removeEventListener('click', this.onOk);
    this.cancelBtn.removeEventListener('click', this.onClose);
  }

  // Renders dark background overlay
  renderDarkBackground(): void {
    const blanketElement = document.querySelector('.aui-blanket');
    if (blanketElement) {
      blanketElement.setAttribute('aria-hidden', 'false');

      // Jira v8.12.3 uses the 'hidden' attribute on the background
      blanketElement.removeAttribute('hidden');
    } else {
      document.body.insertAdjacentHTML('beforeend', '<div class="aui-blanket" tabindex="0" aria-hidden="false"></div>');
    }
  }

  // Removes dark background overlay
  removeDarkBackground(): void {
    const blanketElement = document.querySelector('.aui-blanket');
    if (blanketElement) {
      blanketElement.setAttribute('aria-hidden', 'true');
      blanketElement.setAttribute('hidden', 'true');
    }
  }

  // PUBLIC METHODS

  // Renders the popup
  render(): void {
    this.isOpened = true;
    document.body.insertAdjacentHTML('beforeend', this.html());

    this.htmlElement = document.getElementById(this.popupIdentifiers.wrapperId);
    this.contentBlock = document.getElementById(this.popupIdentifiers.contentWrapperId);
    this.confirmBtn = document.getElementById(this.popupIdentifiers.confirmBtnId);
    this.cancelBtn = document.getElementById(this.popupIdentifiers.cancelBtnId);

    this.renderDarkBackground();
    this.attachButtonHandlers();
  }

  // Unmounts the popup
  unmount = (): void => {
    if (this.htmlElement) {
      this.isOpened = false;

      this.deattachButtonHandlers();
      this.removeDarkBackground();

      this.htmlElement.remove();
    }
  };

  // Appends HTML content to the popup content block
  appendToContent(str = ''): void {
    this.contentBlock?.insertAdjacentHTML('beforeend', str);
  }

  // Clears the content of the popup
  clearContent(): void {
    if (this.contentBlock) {
      while (this.contentBlock.lastElementChild) {
        this.contentBlock.removeChild(this.contentBlock.lastElementChild);
      }
    }
  }

  // Toggles the availability of the confirm button
  toggleConfirmAvailability(isAvailable: boolean): void {
    if (!this.confirmBtn) return;

    if (isAvailable) {
      this.confirmBtn.removeAttribute('disabled');
    } else {
      this.confirmBtn.setAttribute('disabled', 'true');
    }
  }
}
