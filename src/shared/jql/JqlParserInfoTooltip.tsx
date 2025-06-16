import React from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';

const TEXTS = {
  title: {
    en: 'Custom JQL Parser',
    ru: 'Custom JQL парсер',
  },
  supports: {
    en: 'Supports only basic JQL:',
    ru: 'Поддерживает только базовый JQL:',
  },
  andOrNot: {
    en: 'AND, OR, NOT',
    ru: 'AND, OR, NOT',
  },
  eqNeqInNotIn: {
    en: '=, !=, in, not in',
    ru: '=, !=, in, not in',
  },
  containsOps: {
    en: '~ (contains), !~ (not contains)',
    ru: '~ (содержит), !~ (не содержит)',
  },
  containsDesc: {
    en: 'The ~ and !~ operators check if a field contains (or does not contain) a substring. Works for strings, numbers, arrays. LIKE/regex are not supported.',
    ru: 'Операторы ~ и !~ проверяют, содержит ли поле подстроку (или не содержит). Работает для строк, чисел, массивов. LIKE/регулярные выражения не поддерживаются.',
  },
  emptyIsParens: {
    en: 'EMPTY, is, parentheses',
    ru: 'EMPTY, is, скобки',
  },
  quoted: {
    en: 'Quoted values',
    ru: 'Значения в кавычках',
  },
  notSupported: {
    en: 'Not supported:',
    ru: 'Не поддерживается:',
  },
  functions: {
    en: 'Functions (e.g., currentUser())',
    ru: 'Функции (например, currentUser())',
  },
  orderBy: {
    en: 'ORDER BY, sorting',
    ru: 'ORDER BY, сортировка',
  },
  likeRegex: {
    en: 'LIKE, regex',
    ru: 'LIKE, regex',
  },
  nested: {
    en: 'Nested fields (e.g., parent.status)',
    ru: 'Вложенные поля (например, parent.status)',
  },
};

export const JqlParserInfoTooltip: React.FC = () => {
  const texts = useGetTextsByLocale(TEXTS);
  return (
    <Tooltip
      title={
        <div style={{ maxWidth: 340 }}>
          <b>{texts.title}</b>
          <div style={{ marginTop: 4 }}>
            <div>{texts.supports}</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>{texts.andOrNot}</li>
              <li>{texts.eqNeqInNotIn}</li>
              <li>{texts.containsOps}</li>
              <li style={{ fontSize: 12, color: '#888' }}>{texts.containsDesc}</li>
              <li>{texts.emptyIsParens}</li>
              <li>{texts.quoted}</li>
            </ul>
            <div style={{ marginTop: 4 }}>
              <b>{texts.notSupported}</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>{texts.functions}</li>
                <li>{texts.orderBy}</li>
                <li>{texts.likeRegex}</li>
                <li>{texts.nested}</li>
              </ul>
            </div>
          </div>
        </div>
      }
      placement="top"
    >
      <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 18, cursor: 'pointer' }} />
    </Tooltip>
  );
};
