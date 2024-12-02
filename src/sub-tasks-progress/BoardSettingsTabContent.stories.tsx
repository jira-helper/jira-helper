import { Meta, StoryFn, StoryObj } from '@storybook/react';
import React, { useEffect, useState } from 'react';
import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { BoardPropertyService } from 'src/shared/boardPropertyService';
import { BoardProperty, BoardSettingsTabContent } from './BoardSettingsTabContent';

const meta: Meta<typeof BoardSettingsTabContent> = {
  title: 'Features/Sub-tasks Progress/BoardSettingsTabContent',
  component: BoardSettingsTabContent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type StoryType = StoryObj<typeof BoardSettingsTabContent>;

/**
 * SetMocks on useEffect for BoardPagePageObject and BoardPropertyService
 * and cleans up after unmount
 */
const withContext =
  ({
    columnsFromBoard,
    columnsFromBoardProperty,
  }: {
    columnsFromBoard: string[];
    columnsFromBoardProperty: string[];
  }) =>
  (Story: StoryFn) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
      // set static methods on useEffect
      const oldGetColumns = BoardPagePageObject.getColumns;
      BoardPagePageObject.getColumns = () => columnsFromBoard;
      const oldGetBoardProperty = BoardPropertyService.getBoardProperty;
      function getBoardProperty(): Promise<BoardProperty> {
        return Promise.resolve({
          columnsToTrack: columnsFromBoardProperty,
        });
      }
      BoardPropertyService.getBoardProperty = getBoardProperty as any;
      setIsMounted(true);
      return () => {
        BoardPagePageObject.getColumns = oldGetColumns;
        BoardPropertyService.getBoardProperty = oldGetBoardProperty;
      };
    }, []);
    return isMounted ? <Story /> : null;
  };

const columnsFromBoard = ['Column 1', 'Column 2', 'Column 3'];
const columnsFromBoardProperty = ['Column 1', 'Column 3'];
const contexts = {
  boardPropertyHasColumnsToTrack: {
    columnsFromBoard,
    columnsFromBoardProperty,
  },
  boardPropertyHasColumnThatIsNotInBoardAndBoardPropertyHasColumnsThatAreNotInBoardProperty: {
    columnsFromBoard: ['Column 1', 'Column 2', 'Column 3', 'Column 5 (only in board)'],
    columnsFromBoardProperty: ['Column 1', 'Column 3', 'Column 4 (only in board property)'],
  },
  boardPropertyDoesNotHaveColumnsToTrack: {
    columnsFromBoard,
    columnsFromBoardProperty: [],
  },
  aLotOfColumns: {
    columnsFromBoard: Array.from({ length: 15 }, (_, i) => `Column ${i + 1}`),
    columnsFromBoardProperty: Array.from({ length: 15 }, (_, i) => `Column ${i + 1}`),
  },
};

export const Default: StoryType = {
  args: {
    onSave: () => {},
    onCancel: () => {},
  },
  decorators: [withContext(contexts.boardPropertyHasColumnsToTrack)],
};

export const aLotOfColumns: StoryType = {
  args: {
    onSave: () => {},
    onCancel: () => {},
    initialValues: {
      enabled: true,
      showSubTasksProgress: true,
      showParentProgress: true,
    },
  },
  decorators: [withContext(contexts.aLotOfColumns)],
};

export const boardPropertyHasColumnThatIsNotInBoardAndBoardPropertyHasColumnsThatAreNotInBoardProperty: StoryType = {
  decorators: [
    withContext(contexts.boardPropertyHasColumnThatIsNotInBoardAndBoardPropertyHasColumnsThatAreNotInBoardProperty),
  ],
};
