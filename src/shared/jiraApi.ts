import request from '@tinkoff/request-core';
import transformUrl from '@tinkoff/request-plugin-transform-url';
import deduplicateCache from '@tinkoff/request-plugin-cache-deduplicate';
import memoryCache from '@tinkoff/request-plugin-cache-memory';
import http from '@tinkoff/request-plugin-protocol-http';
import compose from '@tinkoff/utils/function/compose';
import map from '@tinkoff/utils/array/map';
import prop from '@tinkoff/utils/object/prop';
import filter from '@tinkoff/utils/array/filter';
import complement from '@tinkoff/utils/function/complement';
import isNil from '@tinkoff/utils/is/nil';
import path from '@tinkoff/utils/object/path';
import pathOr from '@tinkoff/utils/object/pathOr';
import { defaultHeaders } from './defaultHeaders';

const configVersion = 'v1';
const getPropName = (property: string): string => `${property}${configVersion}`;

const boardPropertiesUrl = (boardId: string): string => `agile/1.0/board/${boardId}/properties`;
const boardConfigurationURL = (boardId: string): string => `agile/1.0/board/${boardId}/configuration`;
const boardEditDataURL = 'greenhopper/1.0/rapidviewconfig/editmodel.json?rapidViewId=';
const boardEstimationDataURL = 'greenhopper/1.0/rapidviewconfig/estimation.json?rapidViewId=';

const invalidatedProperties: Record<string, boolean> = {};

// Function to get the base URL based on Jira's installation type
const getContextPath = (() => {
  const { location } = window;
  // @ts-expect-error dont know what is contextPath
  // eslint-disable-next-line prefer-destructuring
  const contextPath: string | undefined = window.contextPath;

  if (typeof contextPath === 'string') {
    return `${location.origin}${contextPath}`;
  }

  if (location.hostname.indexOf('atlassian.net') === -1 && location.toString().split('/')[3] === 'jira') {
    return `${location.origin}/jira`;
  }

  return location.origin;
})();

// Configure the Jira request with base plugins
const requestJira = request([
  defaultHeaders({
    // TODO: solve before merge
    // @ts-expect-error need to solve version injection by another way
    'browser-plugin': `jira-helper/${process.env.PACKAGE_VERSION}`,
  }),
  transformUrl({
    baseUrl: `${getContextPath}/rest/`,
  }),
  deduplicateCache(),
  memoryCache({ allowStale: true }),
  http(),
]);

// Fetch all properties of a board
const getBoardProperties = (boardId: string): Promise<any> => {
  const cacheKey = `${boardId}_propertiesList`;
  const memoryCacheForce = invalidatedProperties[cacheKey] != null;
  delete invalidatedProperties[cacheKey];

  return requestJira({
    url: boardPropertiesUrl(boardId),
    memoryCacheForce,
    type: 'json',
  });
};

// Fetch a specific property of a board
export const getBoardProperty = async (
  boardId: string,
  property: string,
  params: Record<string, any> = {}
): Promise<any | undefined> => {
  const boardProps = await getBoardProperties(boardId);
  if (!boardProps.keys.find((boardProp: { key: string }) => boardProp.key === getPropName(property))) return undefined;

  const cacheKey = `${boardId}_${property}`;
  const memoryCacheForce = invalidatedProperties[cacheKey] != null;
  delete invalidatedProperties[cacheKey];

  return requestJira({
    url: `${boardPropertiesUrl(boardId)}/${getPropName(property)}`,
    memoryCacheForce,
    type: 'json',
    ...params,
  }).then(result => result.value);
};

// Update a specific property of a board
export const updateBoardProperty = (
  boardId: string,
  property: string,
  value: any,
  params: Record<string, any> = {}
): void => {
  const cacheKey = `${boardId}_${property}`;
  invalidatedProperties[cacheKey] = true;
  invalidatedProperties[`${boardId}_propertiesList`] = true;

  requestJira({
    url: `${boardPropertiesUrl(boardId)}/${getPropName(property)}`,
    httpMethod: 'PUT',
    type: 'json',
    payload: value,
    ...params,
  });
};

// Delete a specific property of a board
export const deleteBoardProperty = (boardId: string, property: string, params: Record<string, any> = {}): void => {
  const cacheKey = `${boardId}_${property}`;
  invalidatedProperties[cacheKey] = true;
  invalidatedProperties[`${boardId}_propertiesList`] = true;

  requestJira({
    url: `${boardPropertiesUrl(boardId)}/${getPropName(property)}`,
    httpMethod: 'DELETE',
    type: 'json',
    ...params,
  });
};

// Fetch edit data for a board
export const getBoardEditData = (boardId: string, params: Record<string, any> = {}): Promise<any> => {
  return requestJira({
    url: `${boardEditDataURL}${boardId}`,
    type: 'json',
    ...params,
  });
};

// Fetch configuration data for a board
export const getBoardConfiguration = async (boardId: string, params: Record<string, any> = {}): Promise<any> => {
  return requestJira({
    url: boardConfigurationURL(boardId),
    type: 'json',
    ...params,
  });
};

// Fetch estimation data for a board
export const getBoardEstimationData = (boardId: string, params: Record<string, any> = {}): Promise<any> => {
  return requestJira({
    url: `${boardEstimationDataURL}${boardId}`,
    type: 'json',
    ...params,
  });
};

// Search issues based on JQL query
export const searchIssues = (jql: string, params: Record<string, any> = {}): Promise<any> =>
  requestJira({
    url: `api/2/search?jql=${jql}`,
    type: 'json',
    ...params,
  });

// Load configuration for new issue view
export const loadNewIssueViewEnabled = (params: Record<string, any> = {}): Promise<boolean> =>
  requestJira({
    url: 'greenhopper/1.0/profile/labs-panel/issue-details-popup',
    type: 'json',
    ...params,
  }).then(
    res => res.isEnabled,
    () => false
  );

// Fetch all fields for Jira
const getAllFields = (): Promise<any> =>
  requestJira({
    url: 'api/2/field',
    type: 'json',
  });

// Fetch the ID of the "Flagged" field
const getFlaggedField = async (): Promise<string | undefined> =>
  getAllFields().then(fields => fields.find((field: { name: string }) => field.name === 'Flagged')?.id);

// Get flagged issues using the Flagged field ID
const getFlaggedIssues = (flagField: string) =>
  compose(map(prop('key')), filter(compose(complement(isNil), path(['fields', flagField]))), pathOr(['issues'], []));

// Load flagged issues based on a list of keys
export const loadFlaggedIssues = async (keys: string[]): Promise<any> => {
  const flagField = await getFlaggedField();

  return searchIssues(`key in (${keys.join(',')})&fields=${flagField}`).then(getFlaggedIssues(flagField!));
};

// Fetch user based on a query
export const getUser = (query: string): Promise<any> =>
  Promise.allSettled([
    requestJira({
      url: 'api/2/user/search',
      query: { query },
      type: 'json',
    }),
    requestJira({
      url: 'api/2/user/search',
      query: { username: query },
      type: 'json',
    }),
  ])
    .then(([res1, res2]) => {
      if (res1.status === 'fulfilled') return res1.value;
      if (res2.status === 'fulfilled') return res2.value;
    })
    .then((users: any[]) => {
      if (!query) return users[0];

      const exactMatch = users.find(user => user.name === query || user.displayName === query);
      if (exactMatch) return exactMatch;

      const substringMatch = users.find(user => user.name?.includes(query) || user.displayName?.includes(query));
      return substringMatch || users[0];
    });
