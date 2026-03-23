import { Token } from 'dioma';
import type { IRoutingService } from './IRoutingService';

export const routingServiceToken = new Token<IRoutingService>('routingService');
