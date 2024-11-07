import map from '@tinkoff/utils/array/map';
import each from '@tinkoff/utils/array/each';
import { PageModification } from '../shared/PageModification';
import style from './styles.module.css';

interface SwimlaneStats {
  numberIssues: number;
  arrNumberIssues: number[];
}

export default class extends PageModification<any, Element> {
  private cssSelectorOfIssues: string | null = null;

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `add-swimlane-stats-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-swimlane');
  }

  async loadData(): Promise<any> {
    return this.getBoardEditData();
  }

  async apply(editData: any): Promise<void> {
    this.cssSelectorOfIssues = this.getCssSelectorOfIssues(editData);
    this.calcSwimlaneStatsAndRender();
    this.onDOMChange('#ghx-pool', this.calcSwimlaneStatsAndRender);
  }

  calcSwimlaneStatsAndRender = (): void => {
    const headers = map(
      i => i.textContent!,
      document.querySelectorAll('.ghx-column-title, #ghx-column-headers .ghx-column h2')
    );

    const swimlanesStats: { [key: string]: SwimlaneStats } = {};

    each(sw => {
      const header = sw.getElementsByClassName('ghx-swimlane-header')[0];

      if (!header) return;

      const list = sw.getElementsByClassName('ghx-columns')[0].childNodes;
      let numberIssues = 0;
      const arrNumberIssues: number[] = [];

      list.forEach(column => {
        const tasks = (column as HTMLElement).querySelectorAll(this.cssSelectorOfIssues!);
        arrNumberIssues.push(tasks.length);
        numberIssues += tasks.length;
      });

      swimlanesStats[sw.getAttribute('swimlane-id')!] = { numberIssues, arrNumberIssues };
      this.renderSwimlaneStats(header, headers, numberIssues, arrNumberIssues);
    }, document.querySelectorAll('.ghx-swimlane'));

    const stalker = document.querySelector('#ghx-swimlane-header-stalker');
    if (stalker && stalker.firstElementChild) {
      const swimlaneId = stalker.firstElementChild.getAttribute('data-swimlane-id');
      if (!swimlaneId || !swimlanesStats[swimlaneId]) return;

      const header = stalker.querySelector('.ghx-swimlane-header');
      const { numberIssues, arrNumberIssues } = swimlanesStats[swimlaneId];

      this.renderSwimlaneStats(header!, headers, numberIssues, arrNumberIssues);
    }
  };

  renderSwimlaneStats(header: Element, headers: string[], numberIssues: number, arrNumberIssues: number[]): void {
    const stats = `
    <div class="${style.wrapper}">
      ${arrNumberIssues
        .map((currentNumberIssues, index) => {
          const title = `${headers[index]}: ${currentNumberIssues}`;

          return `
        <div title="${title}" class="${style.column}" style="background: ${currentNumberIssues ? '#999' : '#eee'}">
          <div title="${title}" class="${style.bar}" style="height: ${(
            (20 * currentNumberIssues) /
            numberIssues
          ).toFixed(2)}px"></div>
        </div>
      `;
        })
        .join('')}
    </div>
    `;

    header.classList.add(style.header);
    this.insertHTML(header, 'afterbegin', stats);
  }
}
