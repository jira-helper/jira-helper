import indexBy from '@tinkoff/utils/array/indexBy';
import pluck from '@tinkoff/utils/array/pluck';

export const createLimitKey = ({ fieldValue, fieldId }: { fieldValue: string; fieldId: string }): string =>
  `${new Date().toISOString()}@@${fieldId}@@${fieldValue}`;

// Type definition for normalize function output
export interface NormalizeOutput<T> {
  byId: { [key: string]: T };
  allIds: string[];
}

// Normalize function to create byId and allIds collections
export const normalize = <T extends Record<string, any>, K extends string>(
  byField: K,
  obj: T[]
): NormalizeOutput<T> => ({
  byId: indexBy((x: T) => x[byField], obj),
  allIds: pluck(byField, obj),
});
