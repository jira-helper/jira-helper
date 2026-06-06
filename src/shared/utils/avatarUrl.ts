import { getJiraWebBaseUrl } from 'src/infrastructure/jira/jiraWebContext';

/**
 * Builds a stable Jira avatar URL for a user.
 *
 * This URL always returns the current avatar, even if the user changes it.
 * Works for Jira Server/Data Center, including installs under a context path (e.g. `/jira`).
 *
 * NOTE: This function is registered as DI token `buildAvatarUrlToken`.
 * Use DI injection in containers, not direct import.
 *
 * @param username - Jira username (login name)
 * @returns Stable avatar URL (absolute, same origin + context as the page)
 *
 * @example
 * ```ts
 * // In container component:
 * const buildAvatarUrl = useDi().inject(buildAvatarUrlToken);
 * const url = buildAvatarUrl('jsmith');
 * // e.g. "https://host/jira/secure/useravatar?username=jsmith"
 * ```
 */
export const buildAvatarUrl = (username: string): string => {
  return `${getJiraWebBaseUrl()}/secure/useravatar?username=${encodeURIComponent(username)}`;
};
