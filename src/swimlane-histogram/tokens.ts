import { Token } from 'dioma';
import type { HistogramModel } from './models/HistogramModel';

export const histogramModelToken = new Token<{
  model: Readonly<HistogramModel>;
  useModel: () => Readonly<HistogramModel>;
}>('swimlane-histogram/histogramModel');
