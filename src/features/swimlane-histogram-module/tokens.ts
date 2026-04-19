import { createModelToken } from 'src/shared/di/Module';
import type { HistogramModel } from './models/HistogramModel';

export const histogramModelToken = createModelToken<HistogramModel>('swimlane-histogram/histogramModel');
