import { createModelToken } from 'src/infrastructure/di/Module';
import type { HistogramModel } from './models/HistogramModel';

export const histogramModelToken = createModelToken<HistogramModel>('swimlane-histogram/histogramModel');
