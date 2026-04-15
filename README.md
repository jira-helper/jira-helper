![Build Status](https://github.com/pavelpower/jira-helper/workflows/Node%20CI/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/jira-helper/jira-helper/badge.svg)](https://coveralls.io/github/jira-helper/jira-helper)

## “jira-helper” features

_version 2.30.0_

A browser extension that enhances Jira with advanced visualization, WIP-limits, and workflow management tools.

[Full features documentation](./docs/features-summary.md) | [Detailed documentation](./docs/index.md)

### WIP-Limits and Flow Management
- [WIP-limit for several columns (CONWIP)](./docs/index.md#wip-limits-for-several-columns-conwip)
- [WIP-limit for Swimlanes](./docs/index.md#wip-limits-for-swimlanes)
- [Personal WIP-limit](./docs/index.md#wip-limits-for-individual-team-members)
- [WIP-limit by Field Value](./docs/index.md#wip-limit-for-field-value)
- [WIP-limit on Cells](./docs/index.md#wip-limit-on-cell)

### Board Visualization
- [Card Colors - full card highlighting](./docs/index.md#card-colors)
- [Swimlane Chart Bar - issue count visualization](./docs/index.md#swimlane-chart-bar)
- [Flag on Issue panel](./docs/index.md#flag-on-issue-panel)
- [Secret data blurring](./docs/index.md#secret-data-blurring)

### Task Progress and Relationships
- [Sub-tasks Progress - progress bar on cards](./docs/index.md#sub-tasks-progress)
- [Issue Links Display - show related issues on cards](./docs/index.md#issue-links-display)
- [Days in Column - track time in column](./docs/index.md#days-in-column)
- [Days to Deadline - deadline tracking](./docs/index.md#days-to-deadline)

### Analytics
- [SLA-line for Control Chart with percentile](./docs/index.md#sla-line-for-control-chart)
- [Measurement Ruler on Control Chart](./docs/index.md#control-chart-scale)

### Templates
- [Task Description Template](./docs/index.md#task-description-template)

## Issuing project tasks

All tasks are created at [github issues](https://github.com/pavelpower/jira-helper/issues)

Before creating a task, please make sure that a similar task was not created earlier. Please be sure to check closed tasks - there is a chance that your request has already been fulfilled and will be released soon.


### Requesting a feature

[Create a new task](https://github.com/pavelpower/jira-helper/issues/new)

After adding description, please specify the following attributes only:

- Labels: `feature`
- Project: `jira-helper`


### Requesting a fix

_In case some feature doesn’t operate as expected._

[Create a new task](https://github.com/pavelpower/jira-helper/issues/new)

After adding description, please specify the following attributes only:

- Labels: `invalid`, [`cloud jira`, `jira 7`, `jira 8`] – specify in which JIRA version the problem is reproduced.
- Project: `jira-helper`


### Adding a description for a bug/problem

[Create a new task](https://github.com/pavelpower/jira-helper/issues/new)

After adding description, please specify the following attributes only:

- Labels: `bug`, [`cloud jira`, `jira 7`, `jira 8`] – specify in which JIRA version the problem is reproduced.
- Project: `jira-helper`


### List of most often used labels

|   labels     |    Meaning                                                               |
|--------------|:--------------------------------------------------------------------------|
| `feature`    | new feature                                                          |
| `invalid`    | a feature doesn’t work as expected                                  |
| `bug`        | a problem/error, please be sure to specify a JIRA version label, where one could reproduce it |
| `jira 7`     | reproducible in JIRA 7.x.x                                       |
| `jira 8`     | reproducible in JIRA 8.x.x                                       |
| `cloud jira` | reproducible in JIRA Cloud                                       |


## Installing the extension for development purposes

- install nodejs 20+
- install packages `npm ci`
- for local development of components you can use storybook `npm run storybook`

In Chrome:

Run `npm run build` to build the extension

Open the menu, choose “More tools”, then ["Extensions"](chrome://extensions/)

On the ["Extensions"](chrome://extensions/) page toggle “Developer mode”, press “Load unpacked” in the appeared menu.

Choose the folder where the extension was built, `~/jira-helper/dist`.

In Firefox:

Run `npm run prod:firefox` to build the extension

Open the url - about:debugging#/runtime/this-firefox and click "Load Temporary Add-on".
In the open file upload window, select manifest.json from the dist directory

After that, the plugin will be added to Firefox.


### During development

Run `npm run build` after you change the code.  Then press “Update” in the ["Extensions"](chrome://extensions/) developer menu  and then reload the page, where the extension is being tested.


### Maintaining a git branch and git commits

The branch name should start with an associated task number.

Example: `2-title-issue`, where `2` is the mandatory task number.

Every `commit` should have a task number associated with it.

Example: `[#15] rename *.feature to *.ru.feature`

Please use `english` language only to name branches and commits.

## Publishing information

The official version of the extension is published in ["Chrome WebStore"](https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl)

Release version is the same as the application version in [package.json](./package.json) and the version published in ["Chrome WebStore"](https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl)

_Minimum required Chrome [version is >= 88](./src/manifest.json)_

### Publishing a new version

The extension can be published automatically via GitHub Actions or manually using a script.

#### Automatic publishing (recommended)

1. Update the version in `package.json`
2. Commit and push the changes
3. Create a new [GitHub Release](https://github.com/jira-helper/jira-helper/releases/new) with the tag matching the version (e.g., `v2.29.0`)
4. The GitHub Actions workflow will automatically:
   - Build the extension
   - Upload it to Chrome Web Store
   - Publish it

**Setup required (one-time):**
- Configure GitHub Secrets with Chrome Web Store credentials (see [detailed setup guide](./docs/CHROME_WEBSTORE_PUBLISH.md))

#### Manual publishing

1. Update the version in `package.json`
2. Build the extension:
   ```bash
   npm run prod
   ```
3. Publish to Chrome Web Store:
   ```bash
   CHROME_WEBSTORE_CREDENTIALS_FILE=./path/to/credentials.json node tools/publish-chrome-webstore.js
   ```
   Or using credentials from environment variable:
   ```bash
   CHROME_WEBSTORE_CREDENTIALS='{"type":"service_account",...}' node tools/publish-chrome-webstore.js
   ```

For detailed setup instructions, see the [Chrome Web Store Publishing Guide](./docs/CHROME_WEBSTORE_PUBLISH.md).
