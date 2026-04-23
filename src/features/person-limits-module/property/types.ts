/**
 * PersonLimit v2.29 — формат без showAllPersonIssues.
 * Использовался до добавления опции показа всех задач пользователя при клике на аватар.
 *
 * Special convention for "all" columns/swimlanes:
 * - columns: empty array [] means "all columns"
 * - swimlanes: empty array [] means "all swimlanes"
 */
export type PersonLimit_2_29 = {
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
 * Property v2.29 — массив лимитов без showAllPersonIssues.
 */
export type PersonWipLimitsProperty_2_29 = {
  limits: PersonLimit_2_29[];
};

/**
 * PersonLimit v2.30 — добавлено поле showAllPersonIssues.
 *
 * When true (default): clicking avatar shows ALL person's issues on the board.
 * When false: clicking avatar shows only issues matching the limit criteria
 * (specific columns, swimlanes, issue types).
 */
export type PersonLimit_2_30 = PersonLimit_2_29 & {
  showAllPersonIssues: boolean;
};

export type PersonLimit_2_31 = Omit<PersonLimit_2_30, 'person'> & {
  persons: Array<{ name: string; displayName?: string; self: string }>;
};

export type PersonWipLimitsProperty_2_31 = {
  limits: PersonLimit_2_31[];
};

export type PersonLimit = PersonLimit_2_31;

/**
 * Структура, хранимая в Jira Board Property (текущая версия)
 */
export type PersonWipLimitsProperty = {
  limits: PersonLimit[];
};

export type PersonWipLimitsProperty_2_30 = PersonWipLimitsProperty;
