/**
 * PersonLimit - один лимит для конкретного человека.
 * Хранится в Jira Board Property.
 *
 * Special convention for "all" columns/swimlanes:
 * - columns: empty array [] means "all columns"
 * - swimlanes: empty array [] means "all swimlanes"
 */
export type PersonLimit = {
  id: number;
  person: {
    name: string;
    /** @deprecated Use `name` instead. Kept optional for backward compatibility with old saved data. */
    displayName?: string;
    self: string;
    /**
     * @deprecated Avatar URL is now generated dynamically from `name`.
     * Kept optional for backward compatibility.
     */
    avatar?: string;
  };
  limit: number;
  columns: Array<{ id: string; name: string }>;
  swimlanes: Array<{ id: string; name: string }>;
  includedIssueTypes?: string[];
};

/**
 * Структура, хранимая в Jira Board Property
 */
export type PersonWipLimitsProperty = {
  limits: PersonLimit[];
};
