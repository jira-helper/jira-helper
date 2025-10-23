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
import { Ok, Err, Result } from 'ts-results';
import { defaultHeaders } from './defaultHeaders';
import manifest from '../../manifest.json';
import { JiraField, JiraIssue, JiraIssueLinkType } from './jira/types';

const PACKAGE_VERSION = manifest.version;

const configVersion = 'v1';
const getPropName = (property: string): string => `${property}${configVersion}`;

const boardPropertiesUrl = (boardId: string): string => `agile/1.0/board/${boardId}/properties`;

const boardEditDataURL = 'greenhopper/1.0/rapidviewconfig/editmodel.json?rapidViewId=';

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

const EXTENSION_HEADERS = {
  'browser-plugin': `jira-helper/${PACKAGE_VERSION}`,
};
const BASE_URL = `${getContextPath}/rest/`;

// Configure the Jira request with base plugins
const requestJira = request([
  defaultHeaders(EXTENSION_HEADERS),
  transformUrl({
    baseUrl: BASE_URL,
  }),
  deduplicateCache(),
  memoryCache({ allowStale: true }),
  http(),
]);

const requestJiraViaFetch = async (
  url: string,
  options: RequestInit = {},
  retries = 5
): Promise<Result<Response, Error>> => {
  const rawResponse = await fetch(`${BASE_URL}${url}`, {
    headers: {
      ...EXTENSION_HEADERS,
      ...options.headers,
    },
    ...options,
  }).then(
    r => Ok(r),
    e => Err(e)
  );

  if (rawResponse.err) {
    return rawResponse;
  }
  const response = rawResponse.val;

  if (response.status === 429 && retries > 0) {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    return requestJiraViaFetch(url, options, retries - 1);
  }

  if (response.status < 200 || response.status >= 300) {
    return Err(new Error(`${response.status} ${response.statusText}`));
  }

  return Ok(response);
};

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
export const getBoardProperty = async <T>(
  boardId: string,
  property: string,
  params: Record<string, any> = {}
): Promise<T | undefined> => {
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
  }).then(result => result.value as T);
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
  }).catch(() => {
    // ignore error because PUT method does not return JSON
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

// Search issues based on JQL query
const internalSearchIssues = (jql: string, params: Record<string, any> = {}): Promise<any> =>
  requestJira({
    url: `api/2/search?jql=${jql}`,
    type: 'json',
    ...params,
  });

export const searchIssues = async (
  jql: string,
  searchOptions: {
    maxResults: number;
    expand: 'changelog'[];
  } = {
    maxResults: 100,
    expand: ['changelog'],
  },
  requestOptions: RequestInit = {}
) => {
  const fetchOptions = {
    ...requestOptions,
    headers: {
      ...requestOptions.headers,
      'browser-plugin': `jira-extension/${PACKAGE_VERSION}`,
    },
  };
  let counter = 0;
  const maxRetries = 3;
  // eslint-disable-next-line no-plusplus
  while (counter++ < maxRetries) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(
      `${BASE_URL}api/2/search?jql=${jql}&maxResults=${searchOptions.maxResults}&expand=${searchOptions.expand.join(',')}`,
      {
        ...fetchOptions,
      }
    ).then(
      r => Ok(r),
      e => Err(e)
    );

    if (response.err) {
      return response;
    }

    if (response.val.status === 429) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      continue;
    }

    return response;
  }

  return Err(new Error('Too many retries'));
};
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

  return internalSearchIssues(`key in (${keys.join(',')})&fields=${flagField}`).then(getFlaggedIssues(flagField!));
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

export const getJiraIssue = async (issueId: string, options: RequestInit = {}): Promise<Result<JiraIssue, Error>> => {
  const result = await requestJiraViaFetch(`api/2/issue/${issueId}`, options, 5);
  if (result.err) {
    return Err(result.val);
  }

  const jsonDataResult = await result.val.json().then(
    r => Ok(r),
    e => Err(e)
  );

  if (jsonDataResult.err) {
    return Err(jsonDataResult.val);
  }
  const jsonData = jsonDataResult.val;

  return Ok(jsonData);
};

export const getExternalIssues = async (issueKey: string, options: RequestInit = {}): Promise<Result<any, Error>> => {
  const result = await requestJiraViaFetch(`api/2/issue/${issueKey}/remotelink`, options, 5);
  if (result.err) {
    return Err(result.val);
  }

  const jsonDataResult = await result.val.json().then(
    r => Ok(r),
    e => Err(e)
  );

  if (jsonDataResult.err) {
    return Err(jsonDataResult.val);
  }
  return Ok(jsonDataResult.val);
};

export const renderRemoteLink = async (
  remoteLinkId: number,
  options: RequestInit = {}
): Promise<Result<string, Error>> => {
  const result = await requestJiraViaFetch(`viewIssue/1/remoteIssueLink/render/${remoteLinkId}`, options, 5);
  if (result.err) {
    return Err(result.val);
  }

  return Ok(await result.val.text());
};

export const getProjectFields = async (options: RequestInit = {}): Promise<Result<JiraField[], Error>> => {
  const result = await requestJiraViaFetch('api/2/field', options, 5);
  if (result.err) {
    return Err(result.val);
  }

  const jsonDataResult = await result.val.json().then(
    r => Ok(r),
    e => Err(e)
  );

  if (jsonDataResult.err) {
    return Err(jsonDataResult.val);
  }
  return Ok(jsonDataResult.val);
};

export const getIssueLinkTypes = async (options: RequestInit = {}): Promise<Result<JiraIssueLinkType[], Error>> => {
  const result = await requestJiraViaFetch('api/2/issueLinkType', options, 5);
  if (result.err) {
    return Err(result.val);
  }

  const jsonDataResult = await result.val.json().then(
    r => Ok(r),
    e => Err(e)
  );

  if (jsonDataResult.err) {
    return Err(jsonDataResult.val);
  }
  return Ok(jsonDataResult.val.issueLinkTypes);
};
