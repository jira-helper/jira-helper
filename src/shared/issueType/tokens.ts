import { Token } from 'dioma';
import type { IIssueTypeService } from './IIssueTypeService';

export const issueTypeServiceToken = new Token<IIssueTypeService>('issueTypeService');
