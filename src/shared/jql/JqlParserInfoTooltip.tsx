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
  contains: {
    en: '~ (contains), LIKE, regex',
    ru: '~ (contains), LIKE, regex',
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
        <div style={{ maxWidth: 320 }}>
          <b>{texts.title}</b>
          <div style={{ marginTop: 4 }}>
            <div>{texts.supports}</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>{texts.andOrNot}</li>
              <li>{texts.eqNeqInNotIn}</li>
              <li>{texts.emptyIsParens}</li>
              <li>{texts.quoted}</li>
            </ul>
            <div style={{ marginTop: 4 }}>
              <b>{texts.notSupported}</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>{texts.functions}</li>
                <li>{texts.orderBy}</li>
                <li>{texts.contains}</li>
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
