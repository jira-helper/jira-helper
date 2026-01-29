/**
 * Extract project key from Jira URL
 * Supports both old and new URL formats:
 * - Old: https://company.atlassian.net/secure/RapidBoard.jspa?projectKey=PN&rapidView=12
 * - New: https://company.atlassian.net/jira/software/c/projects/MP/boards/138
 */
export function getProjectKeyFromURL(): string | null {
  const url = window.location.href;
  const searchParams = new URLSearchParams(window.location.search);

  // Try old format: ?projectKey=PN
  const projectKeyFromQuery = searchParams.get('projectKey');
  if (projectKeyFromQuery) {
    return projectKeyFromQuery;
  }

  // Try new format: /projects/{KEY}/boards/
  const match = window.location.pathname.match(/\/projects\/([A-Z]+)\//i);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}
