import { beforeEach, describe, expect, it } from 'vitest';
import { useSubTaskProgressBoardPropertyStore } from './subTaskProgressBoardProperty';
import type { StatusProgressMapping } from 'src/shared/status-progress-mapping/types';

const mapping: StatusProgressMapping = {
  '10001': { statusId: '10001', statusName: 'Selected for Development', bucket: 'todo' },
  '10002': { statusId: '10002', statusName: 'In Progress', bucket: 'inProgress' },
};

describe('subTaskProgressBoardProperty store statusProgressMapping', () => {
  beforeEach(() => {
    useSubTaskProgressBoardPropertyStore.setState(useSubTaskProgressBoardPropertyStore.getInitialState());
  });

  it('defaults statusProgressMapping to an empty object', () => {
    expect(useSubTaskProgressBoardPropertyStore.getState().data.statusProgressMapping).toEqual({});
  });

  it('merges a persisted statusProgressMapping block over initial data', () => {
    useSubTaskProgressBoardPropertyStore.getState().actions.setData({ statusProgressMapping: mapping });

    expect(useSubTaskProgressBoardPropertyStore.getState().data.statusProgressMapping).toEqual(mapping);
  });

  it('sets statusProgressMapping without writing legacy newStatusMapping', () => {
    useSubTaskProgressBoardPropertyStore.getState().actions.setData({
      newStatusMapping: {
        7: { name: 'Legacy In Progress', progressStatus: 'inProgress' },
      },
    });

    useSubTaskProgressBoardPropertyStore.getState().actions.setStatusProgressMapping(mapping);

    expect(useSubTaskProgressBoardPropertyStore.getState().data.statusProgressMapping).toEqual(mapping);
    expect(useSubTaskProgressBoardPropertyStore.getState().data.newStatusMapping).toEqual({
      7: { name: 'Legacy In Progress', progressStatus: 'inProgress' },
    });
  });

  it('removes a single statusProgressMapping entry by status id', () => {
    useSubTaskProgressBoardPropertyStore.getState().actions.setStatusProgressMapping(mapping);

    useSubTaskProgressBoardPropertyStore.getState().actions.removeStatusProgressMapping('10001');

    expect(useSubTaskProgressBoardPropertyStore.getState().data.statusProgressMapping).toEqual({
      '10002': { statusId: '10002', statusName: 'In Progress', bucket: 'inProgress' },
    });
  });

  it('clears all statusProgressMapping entries', () => {
    useSubTaskProgressBoardPropertyStore.getState().actions.setStatusProgressMapping(mapping);

    useSubTaskProgressBoardPropertyStore.getState().actions.clearStatusProgressMapping();

    expect(useSubTaskProgressBoardPropertyStore.getState().data.statusProgressMapping).toEqual({});
  });
});
