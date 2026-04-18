/// <reference types="cypress" />
/**
 * BDD helpers: Jira Helper board panel + Column WIP Limits tab + Board Settings button (modal).
 */
import React, { useState } from 'react';
import Modal from 'antd/es/modal';
import { Tabs } from 'antd';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerLogger } from 'src/shared/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken, getProjectIssueTypesToken } from 'src/shared/di/jiraApiTokens';
import { routingServiceToken, type IRoutingService } from 'src/routing';
import { registerIssueTypeServiceInDI } from 'src/shared/issueType';
import { registerBoardPropertyServiceInDI } from 'src/shared/boardPropertyService';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/page-objects/BoardPage';
import { Ok } from 'ts-results';
import logoUrl from '../../../assets/jira_helper_512x512.png';
import boardSettingsStyles from 'src/features/board-settings/BoardSettingsComponent.module.css';
import { useBoardSettingsStore } from 'src/features/board-settings/stores/boardSettings/boardSettings';
import { BOARD_SETTINGS_TEXTS } from 'src/features/board-settings/texts';
import { useGetTextsByLocale } from 'src/shared/texts';
import { ErrorBoundary } from 'src/shared/components/ErrorBoundary';
import { SettingsButtonContainer } from '../../SettingsPage/components/SettingsButton/SettingsButtonContainer';
import { columnLimitsModule } from '../../module';
import { propertyModelToken, settingsUIModelToken } from '../../tokens';
import { createButtonStubs, columns, type ButtonStubs } from '../../SettingsPage/features/helpers';

export { columns };

let harnessMounted = false;
export let canEditBoard = true;
let buttonStubs: ButtonStubs;

const issueTypes = [
  { id: '1', name: 'Task', subtask: false },
  { id: '2', name: 'Bug', subtask: false },
  { id: '3', name: 'Story', subtask: false },
];

function createBoardPageMock(): IBoardPagePageObject {
  return {
    selectors: {
      pool: '',
      issue: '',
      flagged: '',
      grabber: '',
      grabberTransparent: '',
      sidebar: '',
      column: '',
      columnHeader: '',
      columnTitle: '',
      daysInColumn: '',
      swimlaneHeader: '',
      swimlaneRow: '',
    },
    classlist: { flagged: '' },
    getColumns: () => [],
    listenCards: () => () => {},
    getColumnOfIssue: () => '',
    getDaysInColumn: () => null,
    hideDaysInColumn: () => {},
    getHtml: () => '',
    getSwimlanes: () => [],
    getSwimlaneHeader: () => null,
    getIssueCountInSwimlane: () => 0,
    getIssueCountByColumn: () => [],
    getIssueCountForColumns: () => 0,
    insertSwimlaneComponent: () => {},
    removeSwimlaneComponent: () => {},
    highlightSwimlane: () => {},
    getOrderedColumnIds: () => columns.map(c => c.id),
    getOrderedColumns: () => columns,
    getColumnHeaderElement: () => null,
    getSwimlaneIds: () => [],
    getIssueCountInColumn: () => 0,
    styleColumnHeader: () => {},
    resetColumnHeaderStyles: () => {},
    insertColumnHeaderHtml: () => {},
    removeColumnHeaderElements: () => {},
    highlightColumnCells: () => {},
    resetColumnCellStyles: () => {},
  } as unknown as IBoardPagePageObject;
}

const JiraHelperPanelInner: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const texts = useGetTextsByLocale(BOARD_SETTINGS_TEXTS);
  const settings = useBoardSettingsStore(state => state.data.settings);

  return (
    <>
      <div
        className={boardSettingsStyles.wrapper}
        data-jh-component="boardSettingsComponent"
        onClick={() => setIsModalOpen(true)}
      >
        <img src={logoUrl} alt="" width={32} height={32} />
      </div>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
        destroyOnClose
        width="auto"
        getContainer={false}
        okText={texts.ok}
        cancelText={texts.cancel}
        styles={{
          footer: {
            borderTop: '1px solid var(--ant-color-split, rgba(0, 0, 0, 0.06))',
            marginTop: 0,
            paddingTop: 16,
          },
        }}
      >
        <Tabs defaultActiveKey="1">
          {settings.map(setting => (
            <Tabs.TabPane tab={setting.title} key={setting.title}>
              <ErrorBoundary fallback={<div>Failed to render tab content</div>}>
                <setting.component />
              </ErrorBoundary>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Modal>
    </>
  );
};

type HarnessProps = {
  stubs: ButtonStubs;
};

/** Panel + entry to open legacy Board Settings column limits modal (same DI, shared property). */
export const ColumnLimitsBoardTabBddHarness: React.FC<HarnessProps> = ({ stubs }) => (
  <div>
    <JiraHelperPanelInner />
    <SettingsButtonContainer getColumns={stubs.getColumns} getColumnName={stubs.getColumnName} swimlanes={[]} />
  </div>
);

export const setCanEditBoard = (value: boolean) => {
  canEditBoard = value;
};

export const setupBackground = () => {
  harnessMounted = false;
  canEditBoard = true;
  buttonStubs = createButtonStubs();

  globalContainer.reset();
  registerLogger(globalContainer);

  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
  globalContainer.register({
    token: getBoardIdFromURLToken,
    value: () => 'test-board-123',
  });

  const updateBoardPropertyStub = cy.stub().resolves();
  cy.wrap(updateBoardPropertyStub).as('updateBoardProperty');

  globalContainer.register({
    token: updateBoardPropertyToken,
    value: updateBoardPropertyStub,
  });
  globalContainer.register({
    token: getProjectIssueTypesToken,
    value: async () => Ok(issueTypes),
  });
  globalContainer.register({
    token: routingServiceToken,
    value: {
      getProjectKeyFromURL: () => 'TEST',
      getBoardIdFromURL: () => 'test-board-123',
    } as unknown as IRoutingService,
  });

  registerIssueTypeServiceInDI(globalContainer);
  globalContainer.register({
    token: boardPagePageObjectToken,
    value: createBoardPageMock(),
  });
  registerBoardPropertyServiceInDI(globalContainer);
  columnLimitsModule.ensure(globalContainer);

  globalContainer.inject(propertyModelToken).model.reset();
  globalContainer.inject(settingsUIModelToken).model.reset();

  useBoardSettingsStore.setState({ data: { settings: [] } });
};

export const mountBoardTabHarnessOnce = () => {
  if (harnessMounted) return;
  harnessMounted = true;
  cy.mount(
    <WithDi container={globalContainer}>
      <ColumnLimitsBoardTabBddHarness stubs={buttonStubs} />
    </WithDi>
  );
};
