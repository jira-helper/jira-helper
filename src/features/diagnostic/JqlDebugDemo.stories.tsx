import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { JqlDebugDemoPure } from './JqlDebugDemo';

const meta: Meta<typeof JqlDebugDemoPure> = {
  title: 'Diagnostic/JqlDebugDemo',
  component: JqlDebugDemoPure,
};
export default meta;

type Story = StoryObj<typeof JqlDebugDemoPure>;

export const Empty: Story = {
  render: () => {
    const [issueKey, setIssueKey] = useState('');
    const [jql, setJql] = useState('');
    return (
      <JqlDebugDemoPure
        issueKey={issueKey}
        setIssueKey={setIssueKey}
        jql={jql}
        setJql={setJql}
        loading={false}
        error={null}
        result={null}
        tokens={[]}
        ast={null}
        astResult={null}
        onCheck={() => {}}
      />
    );
  },
};

export const FilledNoResult: Story = {
  render: () => {
    const [issueKey, setIssueKey] = useState('HTLS-123');
    const [jql, setJql] = useState('project = HTLS and status = Done');
    return (
      <JqlDebugDemoPure
        issueKey={issueKey}
        setIssueKey={setIssueKey}
        jql={jql}
        setJql={setJql}
        loading={false}
        error={null}
        result={null}
        tokens={['project', '=', 'HTLS', 'and', 'status', '=', 'Done']}
        ast={null}
        astResult={null}
        onCheck={() => {}}
      />
    );
  },
};

export const Loading: Story = {
  render: () => {
    const [issueKey, setIssueKey] = useState('HTLS-123');
    const [jql, setJql] = useState('project = HTLS and status = Done');
    return (
      <JqlDebugDemoPure
        issueKey={issueKey}
        setIssueKey={setIssueKey}
        jql={jql}
        setJql={setJql}
        loading
        error={null}
        result={null}
        tokens={['project', '=', 'HTLS', 'and', 'status', '=', 'Done']}
        ast={null}
        astResult={null}
        onCheck={() => {}}
      />
    );
  },
};

export const ErrorState: Story = {
  render: () => {
    const [issueKey, setIssueKey] = useState('HTLS-123');
    const [jql, setJql] = useState('project = HTLS and status = Done');
    return (
      <JqlDebugDemoPure
        issueKey={issueKey}
        setIssueKey={setIssueKey}
        jql={jql}
        setJql={setJql}
        loading={false}
        error="JQL Parse Error: Unexpected token"
        result={null}
        tokens={['project', '=', 'HTLS', 'and', 'status', '=', 'Done']}
        ast={null}
        astResult={null}
        onCheck={() => {}}
      />
    );
  },
};

// Complex AST for success/failure
const complexAst = {
  type: 'AND' as const,
  left: {
    type: 'condition' as const,
    field: 'project',
    op: '=',
    value: 'HTLS',
    matched: true,
  },
  right: {
    type: 'OR' as const,
    left: {
      type: 'condition' as const,
      field: 'status',
      op: '=',
      value: 'Done',
      matched: true,
    },
    right: {
      type: 'condition' as const,
      field: 'priority',
      op: '=',
      value: 'High',
      matched: true,
    },
    matched: true,
  },
  matched: true,
};

const complexAstFail = {
  ...complexAst,
  matched: false,
  right: {
    ...complexAst.right,
    left: { ...complexAst.right.left, matched: false },
    right: { ...complexAst.right.right, matched: false },
    matched: false,
  },
};

export const SuccessResult: Story = {
  render: () => {
    const [issueKey, setIssueKey] = useState('HTLS-123');
    const [jql, setJql] = useState('project = HTLS and (status = Done or priority = High)');
    return (
      <JqlDebugDemoPure
        issueKey={issueKey}
        setIssueKey={setIssueKey}
        jql={jql}
        setJql={setJql}
        loading={false}
        error={null}
        result={{ matched: true, conditions: [{ text: jql, matched: true }] }}
        tokens={['project', '=', 'HTLS', 'and', '(', 'status', '=', 'Done', 'or', 'priority', '=', 'High', ')']}
        ast={complexAst}
        astResult={complexAst}
        onCheck={() => {}}
      />
    );
  },
};

export const FailureResult: Story = {
  render: () => {
    const [issueKey, setIssueKey] = useState('HTLS-123');
    const [jql, setJql] = useState('project = HTLS and (status = Done or priority = High)');
    return (
      <JqlDebugDemoPure
        issueKey={issueKey}
        setIssueKey={setIssueKey}
        jql={jql}
        setJql={setJql}
        loading={false}
        error={null}
        result={{ matched: false, conditions: [{ text: jql, matched: false }] }}
        tokens={['project', '=', 'HTLS', 'and', '(', 'status', '=', 'Done', 'or', 'priority', '=', 'High', ')']}
        ast={complexAstFail}
        astResult={complexAstFail}
        onCheck={() => {}}
      />
    );
  },
};
