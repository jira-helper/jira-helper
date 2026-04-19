import type { IBoardPagePageObject } from 'src/page-objects/BoardPage';
import type { Logger } from 'src/shared/Logger';
import type { SwimlaneHistogram, LoadingState } from '../types';

export class HistogramModel {
  histograms: Map<string, SwimlaneHistogram> = new Map();
  state: LoadingState = 'initial';
  error: string | null = null;

  constructor(
    private pageObject: IBoardPagePageObject,
    private logger: Logger
  ) {}

  /** Инициализация: рассчитать гистограммы для всех swimlanes */
  initialize(): void {
    const log = this.logger.getPrefixedLog('HistogramModel.initialize');
    this.state = 'loading';

    try {
      const swimlanes = this.pageObject.getSwimlanes();
      const columnHeaders = this.pageObject.getColumns();

      for (const swimlane of swimlanes) {
        const histogram = this.calculateHistogram(swimlane.id, columnHeaders);
        this.histograms.set(swimlane.id, histogram);
      }

      this.state = 'loaded';
      log(`Calculated histograms for ${swimlanes.length} swimlanes`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.error = errorMessage;
      this.state = 'error';
      log(`Error: ${errorMessage}`, 'error');
    }
  }

  /** Рассчитать гистограмму для одного swimlane */
  calculateHistogram(swimlaneId: string, columnHeaders: string[]): SwimlaneHistogram {
    const counts = this.pageObject.getIssueCountByColumn(swimlaneId);

    const columns = counts.map((issueCount, index) => ({
      columnName: columnHeaders[index] ?? `Column ${index + 1}`,
      issueCount,
    }));

    const totalIssues = columns.reduce((sum, col) => sum + col.issueCount, 0);

    return {
      swimlaneId,
      totalIssues,
      columns,
    };
  }

  /** Обновить гистограммы (при изменении DOM) */
  refresh(): void {
    this.initialize();
  }

  /** Получить гистограмму для swimlane */
  getHistogram(swimlaneId: string): SwimlaneHistogram | undefined {
    return this.histograms.get(swimlaneId);
  }

  /** Cleanup */
  dispose(): void {
    this.histograms.clear();
    this.state = 'initial';
    this.error = null;
  }
}
