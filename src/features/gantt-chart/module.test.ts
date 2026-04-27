import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { ganttChartModule } from './module';
import {
  ganttDataModelToken,
  ganttSettingsModelToken,
  ganttViewportModelToken,
  issueViewPageObjectToken,
} from './tokens';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { IssueViewPageObject } from 'src/infrastructure/page-objects/IssueViewPageObject';
import { registerJiraServiceInDI } from 'src/infrastructure/jira/jiraService';

describe('ganttChartModule', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({ token: loggerToken, value: new Logger() });
    registerJiraServiceInDI(container);
  });

  it('should resolve ganttSettingsModelToken after ensure', () => {
    ganttChartModule.ensure(container);

    const { model } = container.inject(ganttSettingsModelToken);
    expect(model).toBeDefined();
    expect(model.load).toBeTypeOf('function');
    expect(model.reset).toBeTypeOf('function');
  });

  it('should resolve issueViewPageObjectToken after ensure', () => {
    ganttChartModule.ensure(container);

    const pageObject = container.inject(issueViewPageObjectToken);
    expect(pageObject).toBeInstanceOf(IssueViewPageObject);
    expect(pageObject.addSectionInMainFlow).toBeTypeOf('function');
  });

  it('should return singleton model entry on repeated injects', () => {
    ganttChartModule.ensure(container);

    const first = container.inject(ganttSettingsModelToken);
    const second = container.inject(ganttSettingsModelToken);

    expect(first.model).toBe(second.model);
  });

  it('should return singleton page object on repeated injects', () => {
    ganttChartModule.ensure(container);

    const first = container.inject(issueViewPageObjectToken);
    const second = container.inject(issueViewPageObjectToken);

    expect(first).toBe(second);
  });

  it('should resolve ganttDataModelToken after ensure', () => {
    ganttChartModule.ensure(container);

    const { model } = container.inject(ganttDataModelToken);
    expect(model).toBeDefined();
    expect(model.loadSubtasks).toBeTypeOf('function');
    expect(model.recompute).toBeTypeOf('function');
    expect(model.reset).toBeTypeOf('function');
  });

  it('should return singleton gantt data model on repeated injects', () => {
    ganttChartModule.ensure(container);

    const first = container.inject(ganttDataModelToken);
    const second = container.inject(ganttDataModelToken);

    expect(first.model).toBe(second.model);
  });

  it('should resolve ganttViewportModelToken after ensure', () => {
    ganttChartModule.ensure(container);

    const { model } = container.inject(ganttViewportModelToken);
    expect(model).toBeDefined();
    expect(model.setZoomLevel).toBeTypeOf('function');
    expect(model.reset).toBeTypeOf('function');
  });

  it('should return singleton gantt viewport model on repeated injects', () => {
    ganttChartModule.ensure(container);

    const first = container.inject(ganttViewportModelToken);
    const second = container.inject(ganttViewportModelToken);

    expect(first.model).toBe(second.model);
  });
});
