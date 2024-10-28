import indexBy from '@tinkoff/utils/array/indexBy';
import pluck from '@tinkoff/utils/array/pluck';

// Define the type for limitsKey object
export const limitsKey = {
  // Encode function for limitsKey object
  encode: (fieldValue: string, fieldId: string): string => `${fieldValue}@@@${fieldId}`,

  // Decode function for limitsKey object
  decode: (limitKey: string): { fieldValue: string; fieldId: string } => {
    const [fieldValue, fieldId] = limitKey.split('@@@');
    return {
      fieldValue,
      fieldId,
    };
  },
};

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
