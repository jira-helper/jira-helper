Feature: Days in Column — Jira prerequisite in user documentation

  Docs-only acceptance criteria for the Days in Column user guide.
  Scenarios verify EN/RU markdown content, not extension UI or Cypress.
  Source: website/docs/features/card-information/days-in-column.md
  and website/i18n/ru/docusaurus-plugin-content-docs/current/features/card-information/days-in-column.md.

  # Docs-only step conventions (manual review or future doc-lint steps):
  # Given the {locale} Days in Column user guide markdown file
  # When I read the "{section}" section
  # Then the section contains "{text}"
  # And the section includes the Jira UI path "{path}"

  @SC-DOC-EN-1
  Scenario: S1 — EN reader learns the Jira prerequisite from Prerequisites
    Given the English Days in Column user guide at "website/docs/features/card-information/days-in-column.md"
    When the reader opens the documentation page on the site (EN locale)
    And reads the "Prerequisites" section immediately after the metadata table
    Then the section states the feature works only if Jira's "Days in column" is enabled for the board
    And the section includes the UI path "Board Settings → Columns → Days in column"

  @SC-DOC-EN-2
  Scenario: EN How to configure reminds about the Jira board setting
    Given the English Days in Column user guide at "website/docs/features/card-information/days-in-column.md"
    When the reader reads the "How to configure" section
    Then a bullet mentions the Jira board setting "Days in column"
    And the bullet explains that without this setting the jira-helper badge cannot work correctly
    And the bullet includes the path "Board Settings → Columns"

  @SC-DOC-RU-1
  Scenario: S2 — RU reader learns the Jira prerequisite from Требования
    Given the Russian Days in Column user guide at "website/i18n/ru/docusaurus-plugin-content-docs/current/features/card-information/days-in-column.md"
    When the reader opens the documentation page on the site (RU locale)
    And reads the "Требования" section immediately after the metadata table
    Then the section states the feature works only if Jira's "Дни в колонке" is enabled for the board
    And the section includes the UI path "Настройки доски → Колонки → Дни в колонке"

  @SC-DOC-RU-2
  Scenario: RU Как настроить reminds about the Jira board setting
    Given the Russian Days in Column user guide at "website/i18n/ru/docusaurus-plugin-content-docs/current/features/card-information/days-in-column.md"
    When the reader reads the "Как настроить" section
    Then a bullet mentions the Jira board setting "Дни в колонке"
    And the bullet explains that without this setting the jira-helper badge cannot work correctly
    And the bullet includes the path "Настройки доски → Колонки"

  @SC-DOC-EN-3
  Scenario: S3 — EN Troubleshooting links missing badge to disabled Jira setting
    Given the English Days in Column user guide at "website/docs/features/card-information/days-in-column.md"
    When the reader reads the "Troubleshooting" section
    Then the "Badge missing" item mentions that Jira "Days in column" must be enabled
    And the item includes the path "Board Settings → Columns"

  @SC-DOC-RU-3
  Scenario: S3 — RU Troubleshooting links missing badge to disabled Jira setting
    Given the Russian Days in Column user guide at "website/i18n/ru/docusaurus-plugin-content-docs/current/features/card-information/days-in-column.md"
    When the reader reads the "Troubleshooting" section
    Then an item about a missing badge mentions that Jira "Дни в колонке" must be enabled
    And the item includes the path "Настройки доски → Колонки"

  @SC-DOC-PARITY-1
  Scenario: Documentation wording matches the extension Alert (docs ↔ UI parity)
    Given the extension Alert text in "DaysInColumnSettings.tsx" (jiraSettingsRequired)
    When the EN and RU user guides describe the Jira prerequisite
    Then the EN setting label is "Days in column"
    And the RU setting label is "Дни в колонке"
    And the EN UI path matches "Board Settings → Columns → Days in column"
    And the RU UI path matches "Настройки доски → Колонки → Дни в колонке"
    And no extension UI files under "src/" are modified for this task
