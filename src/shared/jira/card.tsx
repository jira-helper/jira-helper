import React, { forwardRef } from 'react';

interface IssueCardProps {
  issueKey: string;
  summary: string;
  grabberColor?: string;
}

// states
// flagged
// without color
// with color

const IssueCard = forwardRef<HTMLDivElement, IssueCardProps>(({ issueKey: key, summary, grabberColor }, ref) => {
  const [projectKey, issueNum] = key.split('-');

  return (
    <div
      ref={ref}
      className="js-detailview ghx-issue js-issue ghx-has-avatar ghx-avatar-not-empty js-parent-drag ghx-days-3 ghx-type-6 ghx-observed ghx-selected"
      data-issue-id="11265152"
      data-issue-key="HTLS-2502"
      role="listitem"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      aria-label={`${key} ${summary}`}
      style={{
        margin: '5px',
        padding: '2px 8px 4px',
        backgroundColor: 'rgb(222, 235, 255)',
        color: 'rgb(23, 43, 77)',
        display: 'block',
        fontSize: '12px',
        lineHeight: '17.1429px',
        position: 'relative',
        borderRadius: '2px',
        width: '190px',
        height: '154px',
      }}
    >
      <div className="ghx-issue-content" style={{ margin: 0, padding: 0 }}>
        <div className="ghx-issue-fields" style={{ margin: '2px 0 0', padding: '0 20px 0 0' }}>
          <div
            className="ghx-key"
            style={{
              margin: 0,
              padding: 0,
              display: 'inline-block',
              lineHeight: '12px',
              overflow: 'hidden',
              maxWidth: '100%',
            }}
          >
            <a
              href={`/browse/${key}`}
              title={key}
              tabIndex={-1}
              className="js-key-link ghx-key-link"
              style={{
                color: 'rgb(94, 108, 132)',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: '20px',
                textTransform: 'none',
                display: 'flex',
                flexWrap: 'nowrap',
              }}
            >
              <span className="ghx-issue-key-link">
                <span className="js-key-link ghx-key-link-project-key" style={{ flex: '1 1 auto', overflow: 'hidden' }}>
                  {projectKey}
                </span>
                <span className="js-key-link ghx-key-link-issue-num" style={{ flex: '1 0 auto', overflow: 'hidden' }}>
                  -{issueNum}
                </span>
              </span>
            </a>
          </div>
          <div className="ghx-summary" title={summary} style={{ margin: 0, padding: 0 }}>
            <span
              className="ghx-inner"
              style={{
                lineHeight: '12px',
                maxHeight: '3.3em',
                display: 'block',
                paddingBottom: '1px',
                overflow: 'hidden',
              }}
            >
              {summary}
            </span>
          </div>
        </div>
        <div className="ghx-extra-fields" style={{ margin: '7px 0 0', padding: 0 }}>
          <div className="ghx-extra-field-row" style={{ margin: 0, padding: 0, lineHeight: 0 }}>
            <span
              className="ghx-extra-field ghx-fa"
              data-tooltip="Issue Size: None"
              style={{
                display: 'inline-block',
                lineHeight: '17.1429px',
                color: 'rgb(151, 160, 175)',
                fontStyle: 'italic',
              }}
            >
              <span className="ghx-extra-field-content" style={{ display: 'block', overflow: 'hidden' }}>
                None
              </span>
            </span>
          </div>
          <div className="ghx-extra-field-row" style={{ margin: 0, padding: 0, lineHeight: 0 }}>
            <span
              className="ghx-extra-field"
              data-tooltip="Size: S"
              style={{ display: 'inline-block', lineHeight: '17.1429px' }}
            >
              <span className="ghx-extra-field-content" style={{ display: 'block', overflow: 'hidden' }}>
                S
              </span>
            </span>
          </div>
          <div className="ghx-extra-field-row" style={{ margin: 0, padding: 0, lineHeight: 0 }}>
            <span
              className="ghx-extra-field"
              data-tooltip="Component/s: Business, Mobile, Web"
              style={{ display: 'inline-block', lineHeight: '17.1429px' }}
            >
              <span className="ghx-extra-field-content" style={{ display: 'block', overflow: 'hidden' }}>
                Business, Mobile, Web
              </span>
            </span>
          </div>
        </div>
      </div>
      <div
        className="ghx-grabber ghx-grabber-transparent"
        style={{
          backgroundColor: grabberColor || 'transparent',
          width: '3px',
          height: '100%',
          left: 0,
          position: 'absolute',
          textIndent: '-9999em',
          top: 0,
          borderTopLeftRadius: '3px',
          borderBottomLeftRadius: '3px',
        }}
      />
      <div
        className="ghx-move-count"
        style={{
          backgroundColor: 'transparent',
          height: '31px',
          width: '30px',
          position: 'absolute',
          right: '-12px',
          top: '-14px',
          zIndex: 20,
        }}
      >
        <b
          style={{
            color: 'rgb(255, 255, 255)',
            fontSize: '12px',
            textAlign: 'center',
            lineHeight: '30px',
            width: '29px',
          }}
        />
      </div>
      <div className="ghx-card-footer" style={{ margin: '3px 0 0', padding: 0, display: 'flex', flexWrap: 'wrap' }}>
        <div className="ghx-avatar" style={{ margin: '0 4px 4px 0', padding: 0, display: 'flex' }}>
          <img
            src="https://jira.tcsbank.ru/secure/useravatar?ownerId=JIRAUSER748958&avatarId=318910"
            className="ghx-avatar-img"
            alt="Assignee: Katarina Nikiforova"
            data-tooltip="Assignee: Katarina Nikiforova"
            style={{ borderRadius: '50%', height: '16px', width: '16px', display: 'inline-block', overflow: 'hidden' }}
          />
        </div>
        <div
          className="ghx-type"
          title="Epic"
          style={{ margin: '0 4px 4px 0', height: '16px', width: '16px', overflow: 'hidden' }}
        >
          <img
            alt="Issue Type: Epic"
            src="https://jira.tcsbank.ru/secure/viewavatar?size=xsmall&avatarId=16507&avatarType=issuetype"
            style={{ height: '16px', width: '16px', overflow: 'hidden' }}
          />
        </div>
        <div className="ghx-flags" style={{ margin: '0 4px 4px 0', height: '16px', width: '16px', overflow: 'hidden' }}>
          <span className="ghx-priority" title="Major" style={{ height: '16px', width: '16px', overflow: 'hidden' }}>
            <img
              src="https://jira.tcsbank.ru/images/icons/priorities/major.svg"
              alt="Priority: Major"
              style={{ height: '16px', width: '16px', overflow: 'hidden' }}
            />
          </span>
        </div>
        <div className="ghx-days" title="3 days in this column" style={{ width: '100%' }}>
          <b style={{ display: 'block', height: '4px', width: '37px' }} />
        </div>
      </div>
    </div>
  );
});

export { IssueCard };
