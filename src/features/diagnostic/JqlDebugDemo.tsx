import React, { useState } from 'react';
import { Input, Button, Alert, Spin, List, Typography } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { parseJqlAst, tokenize, evaluateJqlAst, JqlAstNode, JqlAstResult } from 'src/shared/jql/simpleJqlParser';
import { useDi } from 'src/shared/diContext';
import { JiraServiceToken } from 'src/shared/jira/jiraService';
import { getFieldValueForJqlStandalone } from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/useSubtasksProgress';
import { useGetFields } from 'src/shared/jira/fields/useGetFields';
import { JqlParserInfoTooltip } from 'src/shared/jql/JqlParserInfoTooltip';
import { useGetTextsByLocale } from 'src/shared/texts';

const { Text } = Typography;

const TEXTS = {
  title: {
    en: 'JQL Debug Demo',
    ru: 'Отладка JQL',
  },
  issueKey: {
    en: 'Issue Key',
    ru: 'Ключ задачи',
  },
  jql: {
    en: 'JQL',
    ru: 'JQL',
  },
  issueKeyPlaceholder: {
    en: 'Issue Key (e.g. THF-123)',
    ru: 'Ключ задачи (например, THF-123)',
  },
  jqlPlaceholder: {
    en: 'JQL (e.g. project = THF)',
    ru: 'JQL (например, project = THF)',
  },
  check: {
    en: 'Check',
    ru: 'Проверить',
  },
  tokens: {
    en: 'Tokens:',
    ru: 'Токены:',
  },
  ast: {
    en: 'AST:',
    ru: 'AST:',
  },
  matched: {
    en: 'JQL matched this issue',
    ru: 'JQL соответствует этой задаче',
  },
  notMatched: {
    en: 'JQL did NOT match this issue',
    ru: 'JQL НЕ соответствует этой задаче',
  },
  conditionBreakdown: {
    en: 'Condition breakdown',
    ru: 'Пояснение условий',
  },
};

// Pure UI component
export interface JqlDebugDemoPureProps {
  issueKey: string;
  setIssueKey: (v: string) => void;
  jql: string;
  setJql: (v: string) => void;
  loading: boolean;
  error: string | null;
  result: null | { matched: boolean; conditions: { text: string; matched: boolean }[] };
  tokens: string[];
  ast: JqlAstNode | null;
  astResult: JqlAstResult | null;
  onCheck: () => void;
}

export const JqlDebugDemoPure: React.FC<JqlDebugDemoPureProps> = ({
  issueKey,
  setIssueKey,
  jql,
  setJql,
  loading,
  error,
  result,
  tokens,
  ast,
  astResult,
  onCheck,
}) => {
  const texts = useGetTextsByLocale(TEXTS);

  function renderAstTree(node: JqlAstResult, depth = 0) {
    if (!node) return null;
    const icon = node.matched ? (
      <CheckCircleTwoTone twoToneColor="#52c41a" />
    ) : (
      <CloseCircleTwoTone twoToneColor="#ff4d4f" />
    );
    let label = '';
    if (node.type === 'AND' || node.type === 'OR') {
      label = node.type;
    } else if (node.type === 'NOT') {
      label = 'NOT';
    } else if (node.type === 'condition') {
      if ('values' in node && node.values) {
        label = `${node.field} ${node.op} (${node.values.join(', ')})`;
      } else {
        label = `${node.field} ${node.op} ${node.value}`;
      }
    }
    return (
      <div
        style={{
          marginLeft: depth * 20,
          display: 'flex',
          alignItems: 'center',
          color: node.matched ? undefined : '#ff4d4f',
        }}
      >
        {icon} <span style={{ marginLeft: 4 }}>{label}</span>
        {node.type === 'AND' || node.type === 'OR' ? (
          <div style={{ marginLeft: 0 }}>
            {renderAstTree(node.left, depth + 1)}
            {renderAstTree(node.right, depth + 1)}
          </div>
        ) : null}
        {node.type === 'NOT' ? renderAstTree(node.expr, depth + 1) : null}
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginTop: 32, maxWidth: 600 }}>
      <h3>{texts.title}</h3>
      <div style={{ height: 12 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
        <div style={{ width: 180, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{texts.issueKey}</div>
          <Input
            placeholder={texts.issueKeyPlaceholder}
            value={issueKey}
            onChange={e => setIssueKey(e.target.value)}
            style={{ width: 180 }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 500, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            {texts.jql} <JqlParserInfoTooltip />
          </div>
          <Input
            placeholder={texts.jqlPlaceholder}
            value={jql}
            onChange={e => setJql(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'end', height: '100%' }}>
          <Button type="primary" onClick={onCheck} disabled={!issueKey || !jql} loading={loading}>
            {texts.check}
          </Button>
        </div>
      </div>
      {tokens.length > 0 && (
        <div style={{ margin: '8px 0' }}>
          <b>{texts.tokens}</b>{' '}
          {tokens.map((t, i) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={`${t}-${i}`}
              style={{
                display: 'inline-block',
                marginRight: 4,
                padding: '2px 6px',
                border: '1px solid #eee',
                borderRadius: 4,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {ast && (
        <div style={{ margin: '8px 0' }}>
          <b>{texts.ast}</b>
          <div style={{ marginTop: 4 }}>{astResult && renderAstTree(astResult)}</div>
        </div>
      )}
      {loading && <Spin />}
      {error && <Alert type="error" message={error} showIcon style={{ marginTop: 8 }} />}
      {result && (
        <div style={{ marginTop: 16 }}>
          <Alert
            type={result.matched ? 'success' : 'error'}
            message={result.matched ? texts.matched : texts.notMatched}
            showIcon
          />
          <List
            header={<div>{texts.conditionBreakdown}</div>}
            dataSource={result.conditions}
            renderItem={item => (
              <List.Item>
                <Text>
                  {item.matched ? (
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                  ) : (
                    <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                  )}{' '}
                  {item.text}
                </Text>
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

// Container component
export const JqlDebugDemo: React.FC = () => {
  const di = useDi();
  const jiraService = di.inject(JiraServiceToken);
  const { fields } = useGetFields();
  const [issueKey, setIssueKey] = useState('');
  const [jql, setJql] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<null | { matched: boolean; conditions: { text: string; matched: boolean }[] }>(
    null
  );
  const [tokens, setTokens] = useState<string[]>([]);
  const [ast, setAst] = useState<JqlAstNode | null>(null);
  const [astResult, setAstResult] = useState<JqlAstResult | null>(null);

  const handleCheck = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    setTokens([]);
    setAst(null);
    setAstResult(null);
    try {
      // Fetch issue data
      const res = await jiraService.fetchJiraIssue(issueKey, new AbortController().signal);
      if (res.err) throw res.val;
      const issue = res.val;
      // Tokenize and parse JQL
      let localAst: JqlAstNode;
      let localTokens: string[];
      try {
        localTokens = tokenize(jql);
        setTokens(localTokens);
        localAst = parseJqlAst(jql);
        setAst(localAst);
      } catch (e: any) {
        setError(`JQL Parse Error: ${e.message}`);
        setLoading(false);
        return;
      }
      // Evaluate AST
      const localAstResult = evaluateJqlAst(localAst, getFieldValueForJqlStandalone(issue, fields));
      setAstResult(localAstResult);
      // For now, just show overall match; TODO: breakdown if parser supports
      const { matched } = localAstResult;
      const conditions = [{ text: jql, matched }];
      setResult({ matched, conditions });
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <JqlDebugDemoPure
      issueKey={issueKey}
      setIssueKey={setIssueKey}
      jql={jql}
      setJql={setJql}
      loading={loading}
      error={error}
      result={result}
      tokens={tokens}
      ast={ast}
      astResult={astResult}
      onCheck={handleCheck}
    />
  );
};
