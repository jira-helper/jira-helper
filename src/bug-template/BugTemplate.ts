import { PageModification } from '../shared/PageModification';
import style from './styles.module.css';

const defaultIframeTemplate = `Device: <br />
OS: <br />
Account: <br />
Condition: <br /> <br />
Playback Steps: <br /> <br />
Actual result: <br />
Expected Result: <br /> <br />
TK:`;

const defaultTextareaTemplate = defaultIframeTemplate.replace(/<br \/>/g, '\n');
const createIssueDialogIdentifiers = ['#create-issue-dialog', '#issue-create', '#create-subtask-dialog'];
const descriptionInDialogSelector = '.jira-wikifield';
const buttonAddCls = style.buttonJiraAddTemplateForBug;
const buttonSaveCls = style.buttonJiraSaveTemplateForBug;
const localStorageTemplateTextarea = 'jira_helper_textarea_bug_template';
const textToHtml = (text: string) => text.replace(/\n/g, '<br />');

export default class extends PageModification {
  getModificationId() {
    return 'bug-template';
  }

  getTextareaContainer(): Element | undefined {
    for (const dialogId of createIssueDialogIdentifiers) {
      const container = document.querySelector(`${dialogId} ${descriptionInDialogSelector}`);

      if (container) {
        return container;
      }
    }
  }

  apply() {
    this.applyTemplate();

    const elements = createIssueDialogIdentifiers.map(selector => this.waitForElement(selector, document.body));

    Promise.race(elements).then(target => {
      this.onDOMChange(`#${target.id}`, this.applyTemplate, { childList: true, subtree: true });
    });

    this.onDOMChange('body', mutationEvents => {
      mutationEvents.forEach(event => {
        event.removedNodes.forEach(node => {
          // @ts-expect-error not every node has an id
          if (createIssueDialogIdentifiers.includes(`#${node.id}`)) {
            this.clear();
            this.apply();
          }
        });
      });
    });
  }

  applyTemplate = () => {
    if (!this.getTextareaContainer()) return;

    const isButtonsAlreadyAppended = document.querySelectorAll(`.${buttonAddCls}, .${buttonSaveCls}`).length > 0;
    if (isButtonsAlreadyAppended) return;

    this.makeButton({
      text: '&#9998;',
      title: 'Add template',
      handleClick: this.addTemplate,
      cls: buttonAddCls,
    });
    this.makeButton({
      text: '&#128190;',
      title: 'Save template',
      handleClick: this.saveTemplate,
      cls: buttonSaveCls,
    });
  };

  makeButton({ text, title, handleClick, cls }: { text: string; title: string; handleClick: () => void; cls: string }) {
    const btn = this.insertHTML(
      this.getTextareaContainer()!,
      'beforeend',
      `<button class="${cls}" title="${title}">${text}</button>`
    );
    if (!btn) return;
    this.addEventListener(btn, 'click', handleClick);
  }

  addTemplate = () => {
    let iframe: Element | null = null;
    for (const dialogId of createIssueDialogIdentifiers) {
      iframe = document.querySelector(`${dialogId} ${descriptionInDialogSelector} iframe`);
      if (iframe) {
        break;
      }
    }

    let textarea: HTMLTextAreaElement | null = null;
    for (const dialogId of createIssueDialogIdentifiers) {
      textarea = document.querySelector(`${dialogId} ${descriptionInDialogSelector} textarea#description`);
      if (textarea) {
        break;
      }
    }

    const textTextarea = localStorage.getItem(localStorageTemplateTextarea);
    const templateIframe = textTextarea ? textToHtml(textTextarea) : defaultIframeTemplate;
    const templateTextarea = textTextarea || defaultTextareaTemplate;

    if (iframe) {
      // @ts-expect-error contentDocument is not always available
      const text = iframe.contentDocument.getElementById('tinymce').firstChild;
      text.innerHTML = text.innerHTML.length > 0 ? `${text.innerHTML}<br />${templateIframe}` : templateIframe;
    }

    if (textarea) {
      textarea.value = textarea.value.length > 0 ? `${textarea.value}\n${templateTextarea}` : templateTextarea;
    }
  };

  saveTemplate = () => {
    let textarea: HTMLTextAreaElement | null = null;
    for (const dialogId of createIssueDialogIdentifiers) {
      textarea = document.querySelector(`${dialogId} ${descriptionInDialogSelector} textarea#description`);
      if (textarea) {
        break;
      }
    }
    if (!textarea) return;

    if (!window.confirm(`Are you sure you want to save the text "${textarea.value}" in the template?`)) {
      return;
    }

    localStorage.setItem(localStorageTemplateTextarea, textarea.value);
  };

  onCloseDialog() {}
}
