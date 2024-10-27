/* eslint-disable max-classes-per-file */
import Draggable from 'gsap/Draggable';
import { TweenLite, gsap } from 'gsap';
import { PageModification } from '../shared/PageModification';
import { extensionApiService } from '../shared/ExtensionApiService';
import { getChartLinePosition, getChartTics, getChartValueByPosition } from './utils';

interface GridOptions {
  fibonacci: number[][];
  linear: number[][];
}

class ResizableDraggableGrid {
  static gridOptions: GridOptions = {
    fibonacci: [
      [1, 2, 3, 5],
      [1, 2, 3, 5, 8],
      [1, 2, 3, 5, 8, 13],
    ],
    linear: (function s(min: number, max: number) {
      const result: number[][] = [];
      for (let i = min; i <= max; i++) {
        result[i - min] = [];

        for (let j = 1; j <= i; j++) {
          result[i - min][j - 1] = j;
        }
      }
      return result;
    })(2, 10),
  };

  static ids = {
    gridContainer: 'jira-helper-grid-container',
    gridDraggable: 'jira-helper-grid-draggable',
    gridDragResizer: 'jira-helper-grid-drag-resizer',
    gridFormSelect: 'jira-helper-grid-select',
    gridFormCheckbox: 'jira-helper-grid-checkbox-visibility',
    gridLines: 'jira-helper-grid-lines-wrp',
  };

  static jiraSelectors = {
    layerGrid: '.layer.grid',
    controlChart: '#control-chart',
    chartOptionsColumn: '#ghx-chart-options-view',
  };

  chartElement: HTMLElement;

  addEventListener: (element: HTMLElement | null, event: string, handler: EventListenerOrEventListenerObject) => void;

  gridSelectedOption: string;

  gridContainer: HTMLElement | null;

  gridDraggable: HTMLElement | null;

  tweenLite: typeof TweenLite;

  gsap: typeof gsap;

  constructor(
    chartElement: HTMLElement,
    pageModificationEventListener: (
      element: HTMLElement | null,
      event: string,
      handler: EventListenerOrEventListenerObject
    ) => void
  ) {
    this.chartElement = chartElement;
    this.addEventListener = pageModificationEventListener;

    this.gridSelectedOption = 'linear_0'; // type-in-grid-options_index
    this.gridContainer = null;
    this.gridDraggable = null;

    // gsap don't work in firefox, so we load library only when we create this chart
    // eslint-disable-next-line global-require

    this.tweenLite = TweenLite;
    this.gsap = gsap;
  }

  handleChangeOption = (val: string): void => {
    this.gridSelectedOption = val;
    this.renderLines(this.numberArrayBySelectedOption);
  };

  addManipulationAbilities(): void {
    const resizer = document.createElement('div');
    resizer.id = `${ResizableDraggableGrid.ids.gridDragResizer}`;
    this.gridDraggable!.appendChild(resizer);

    const rect1 = this.gridDraggable!.getBoundingClientRect();
    this.tweenLite.set(resizer, { x: rect1.width, y: 0 });

    const onResize = (x: number, y: number): void => {
      this.tweenLite.set(this.gridDraggable, {
        width: x + 0,
        height: rect1.height - y,
      });
      this.renderLines(this.numberArrayBySelectedOption);
    };

    Draggable.create(resizer, {
      bounds: this.gridContainer!,
      autoScroll: 1,
      onPress(e: Event) {
        e.stopPropagation();
      },
      onDrag(): void {
        // "this" points to special gsap object event
        onResize((this as any).x, (this as any).y);
      },
    });
  }

  renderOptionsForm(): void {
    const optionsColumn = document.querySelector(ResizableDraggableGrid.jiraSelectors.chartOptionsColumn);

    const { fibonacci, linear } = ResizableDraggableGrid.gridOptions;
    const gridOptionsForm = document.createElement('div');
    gridOptionsForm.innerHTML = `
    <form class="aui">
        <div class="field-group">
            <label>Grid</label>
            <div style="display: flex; align-items: center">
                <input type="checkbox" style="margin-right: 8px" id="${
                  ResizableDraggableGrid.ids.gridFormCheckbox
                }" alt="Toggle Grid Visibility"/>
                <select class="select" id="${ResizableDraggableGrid.ids.gridFormSelect}">
                    ${fibonacci.map((arr, i) => `<option value="fibonacci_${i}">Fibonacci - ${arr.join()}</option>`)}
                    ${linear.map((arr, i) => `<option value="linear_${i}">Linear - ${arr.join()}</option>`)}
                </select>
            </div>
        </div>
    </form>
  `;
    optionsColumn?.appendChild(gridOptionsForm);

    const gridSelect = document.getElementById(ResizableDraggableGrid.ids.gridFormSelect) as HTMLSelectElement;
    gridSelect.value = 'linear_0';
    this.addEventListener(gridSelect, 'change', (e: Event) =>
      this.handleChangeOption((e.target as HTMLSelectElement).value)
    );

    const gridCheckBox = document.getElementById(ResizableDraggableGrid.ids.gridFormCheckbox) as HTMLInputElement;
    this.addEventListener(gridCheckBox, 'change', (e: Event) => {
      if (this.gridContainer) {
        this.gridContainer.style.display = (e.target as HTMLInputElement).checked ? 'block' : 'none';
        if ((e.target as HTMLInputElement).checked) this.renderLines(this.numberArrayBySelectedOption);
      } else {
        this.renderGrid();
      }
    });
  }

  renderLines(linesStops: number[]): void {
    const oldLines = document.getElementById(ResizableDraggableGrid.ids.gridLines);
    if (oldLines) oldLines.remove();

    const ticsVals = getChartTics(this.chartElement);

    const maxNumber = Math.max(...linesStops);
    const chartHeight = this.gridContainer!.getBoundingClientRect().height;

    const gridHeight = this.gridDraggable!.getBoundingClientRect().height;
    const gridTopPosition = chartHeight - gridHeight;
    const gridTopValue = getChartValueByPosition(ticsVals, gridTopPosition);

    const getLineValue = (num: number) => (num / maxNumber) * gridTopValue;
    const getPositionOfLine = (num: number) => chartHeight - getChartLinePosition(ticsVals, getLineValue(num));

    const lines = document.createElement('div');
    lines.id = ResizableDraggableGrid.ids.gridLines;
    lines.innerHTML = linesStops
      .map(
        number =>
          `<div style="bottom: ${getPositionOfLine(number)}px">${number} SP, ${
            Math.round(getLineValue(number) * 10) / 10
          } days</div>`
      )
      .join('');
    this.gridDraggable!.append(lines);
  }

  renderContainer(): void {
    const layerGrid = document.querySelector(ResizableDraggableGrid.jiraSelectors.layerGrid) as HTMLElement;
    const controlChart = document.querySelector(ResizableDraggableGrid.jiraSelectors.controlChart) as HTMLElement;
    const layerGridBoundingClientRect = layerGrid.getBoundingClientRect();

    const gridContainer = document.createElement('div');
    gridContainer.id = ResizableDraggableGrid.ids.gridContainer;

    const gridDraggable = document.createElement('div');
    gridDraggable.id = ResizableDraggableGrid.ids.gridDraggable;

    const styles = document.createElement('style');
    styles.innerHTML = `
      #${ResizableDraggableGrid.ids.gridContainer} {
        width: ${layerGridBoundingClientRect.width}px;
        height: ${layerGridBoundingClientRect.height}px;
        top: 11px;
        left: 62px;
        position: absolute;
      }

      #${ResizableDraggableGrid.ids.gridDragResizer} {
        position: absolute;
        bottom: 110px;
        width: 0px;
        height: 0px;
        margin-left: -17px;
        border-style: solid;
        border-width: 16px 0 0 16px;
        border-color: #aaa transparent transparent transparent;
        cursor: ne-resize !important;
        pointer-events: all !important;
      }

      #${ResizableDraggableGrid.ids.gridDraggable} {
        position: absolute;
        border: 1px solid #aaa;
        bottom: 0;
        left: 0;
        width: 300px;
        height: 125px;
        pointer-events: all !important;
        transform: translate3d(0px, 0px, 0px);
      }

      #${ResizableDraggableGrid.ids.gridDraggable} svg {
        width: 100%; height: 100%;
      }

      #${ResizableDraggableGrid.ids.gridLines} > div {
        position: absolute;
        bottom: 0;
        height: 1px;
        background: gray;
        width: 100%;
        pointer-events: none;
      }

      #${ResizableDraggableGrid.ids.gridLines} > div:last-child {
        background: none;
      }

      #${ResizableDraggableGrid.ids.gridLines} {
        width: 100%;
        height:100%;
        pointer-events: none;
      }
`;

    gridContainer.append(gridDraggable, styles);
    controlChart.append(gridContainer);

    this.gridContainer = gridContainer;
    this.gridDraggable = gridDraggable;
  }

  renderGrid(): void {
    this.renderContainer();
    this.addManipulationAbilities();

    this.renderLines(this.numberArrayBySelectedOption);
  }

  init(): void {
    this.gsap.registerPlugin(Draggable);
    this.renderOptionsForm();
  }

  get numberArrayBySelectedOption(): number[] {
    const [type, index] = this.gridSelectedOption.split('_');
    return ResizableDraggableGrid.gridOptions[type as keyof GridOptions][parseInt(index, 10)];
  }
}

export default class extends PageModification {
  shouldApply(): boolean {
    return this.getSearchParam('chart') === 'controlChart' || this.getReportNameFromURL() === 'control-chart';
  }

  getModificationId(): string {
    return `add-sla-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<any> {
    return this.waitForElement('#control-chart svg');
  }

  loadData(): Promise<undefined> {
    return Promise.resolve(undefined);
  }

  async apply(_: undefined, chartElement: HTMLElement): Promise<void> {
    await this.waitForElement('.tick', chartElement);

    if (extensionApiService.isFirefox()) {
      // eslint-disable-next-line no-console
      console.warn('jira-helper: AddChartGrid is not supported in Firefox');
      return;
    }

    // @ts-expect-error problem that is hard to solve quickly. Maybe need to be refactored
    const grid = new ResizableDraggableGrid(chartElement, this.addEventListener.bind(this));
    grid.init();
  }
}
