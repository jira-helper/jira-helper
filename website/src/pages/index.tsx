import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import Layout from '@theme/Layout';

function HeroSection() {
  return (
    <header className="hero">
      <div className="container hero__inner">
        <div className="hero__text">
          <h1 className="hero__title">
            <Translate id="homepage.hero.title">
              Turn Jira into a real Kanban system
            </Translate>
          </h1>
          <p className="hero__subtitle">
            <Translate id="homepage.hero.subtitle">
              Open-source browser extension. No servers, no accounts, no telemetry.
              Just professional Kanban — inside your existing Jira.
            </Translate>
          </p>
          <div className="hero__cta">
            <Link
              className="button button--secondary button--lg"
              href="https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl">
              <Translate id="homepage.hero.ctaChrome">Add to Chrome — free</Translate>
            </Link>
            <Link
              className="button button--outline button--lg"
              to="/docs/getting-started/installation">
              <Translate id="homepage.hero.ctaDocs">Documentation →</Translate>
            </Link>
          </div>
        </div>
        <div className="hero__mockup">
          <div className="mockup-board">
            <div className="mockup-header">
              <Translate id="homepage.mockup.header">Jira Board — with jira-helper</Translate>
            </div>

            <div className="mockup-avatars">
              <div className="mockup-avatar mockup-avatar--green">
                <div className="mockup-avatar-face">A</div>
                <span className="mockup-avatar__count">2/3</span>
              </div>
              <div className="mockup-avatar mockup-avatar--red">
                <div className="mockup-avatar-face">B</div>
                <span className="mockup-avatar__count">4/3</span>
              </div>
            </div>

            <div className="mockup-swimlane">
              <div className="mockup-swimlane-header">
                <Translate id="homepage.mockup.swimlane">Team Backend</Translate>
                <span className="mockup-wip-badge mockup-wip-badge--green">2/5</span>
              </div>
              <div className="mockup-columns">
                <div className="mockup-col">
                  <div className="mockup-col-header">
                    <Translate id="homepage.mockup.colTodo">To Do</Translate>
                  </div>
                  <div className="mockup-card">TASK-103 Setup CI</div>
                </div>
                <div className="mockup-col-group mockup-wip">
                  <div className="mockup-wip-badge">3 / 5</div>
                  <div className="mockup-col mockup-col--group">
                    <div className="mockup-col-header">
                      <Translate id="homepage.mockup.colInProgress">In Progress</Translate>
                    </div>
                    <div className="mockup-card">
                      <span className="mockup-badge blue">3d</span>
                      <span className="mockup-badge red">⏰ 1d</span>
                      TASK-99 API
                      <div className="mockup-link-chip blocks">← PROJ-12</div>
                    </div>
                  </div>
                  <div className="mockup-col mockup-col--group">
                    <div className="mockup-col-header">
                      <Translate id="homepage.mockup.colReview">Review</Translate>
                    </div>
                    <div className="mockup-card">
                      <span className="mockup-badge green">1d</span>
                      <span className="mockup-icon mockup-icon--ok">✓</span>
                      TASK-97 UI
                      <div className="mockup-progress">
                        <div className="mockup-progress-bar">
                          <div className="mockup-progress-bar__done" style={{width: '60%'}} />
                          <div className="mockup-progress-bar__wip" style={{width: '40%'}} />
                        </div>
                        <span>3/5</span>
                      </div>
                    </div>
                    <div className="mockup-card">
                      <span className="mockup-badge yellow">5d</span>
                      <span className="mockup-icon mockup-icon--warn">⚠</span>
                      TASK-95 Auth
                      <div className="mockup-link-chip relates">→ PROJ-34</div>
                    </div>
                  </div>
                </div>
                <div className="mockup-col">
                  <div className="mockup-col-header">
                    <Translate id="homepage.mockup.colDone">Done</Translate>
                  </div>
                  <div className="mockup-card">TASK-90 Docs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: '≡',
      color: 'blue',
      title: translate({
        id: 'homepage.features.columnWip.title',
        message: 'Column WIP Limits',
      }),
      description: translate({
        id: 'homepage.features.columnWip.description',
        message: 'Group columns under shared limits. Visual alerts when exceeded.',
      }),
      link: '/docs/features/wip-limits/column-limits',
    },
    {
      icon: '◉',
      color: 'green',
      title: translate({
        id: 'homepage.features.personalWip.title',
        message: 'Personal WIP Limits',
      }),
      description: translate({
        id: 'homepage.features.personalWip.description',
        message: 'Per-person workload balance with avatar badges.',
      }),
      link: '/docs/features/wip-limits/personal-limits',
    },
    {
      icon: '↗',
      color: 'orange',
      title: translate({
        id: 'homepage.features.gantt.title',
        message: 'Gantt Chart',
      }),
      description: translate({
        id: 'homepage.features.gantt.description',
        message: 'Interactive timeline on issue pages. Zoom, pan, filters.',
      }),
      link: '/docs/features/gantt-chart',
    },
    {
      icon: '⬡',
      color: 'red',
      title: translate({
        id: 'homepage.features.cardColors.title',
        message: 'Card Colors',
      }),
      description: translate({
        id: 'homepage.features.cardColors.description',
        message: 'Full card highlighting via JQL — not just a thin strip.',
      }),
      link: '/docs/features/board-visualization/card-colors',
    },
    {
      icon: '◷',
      color: 'blue',
      title: translate({
        id: 'homepage.features.daysInColumn.title',
        message: 'Days in Column',
      }),
      description: translate({
        id: 'homepage.features.daysInColumn.description',
        message: 'See how long each issue sits in its current column.',
      }),
      link: '/docs/features/card-information/days-in-column',
    },
    {
      icon: '⏽',
      color: 'green',
      title: translate({
        id: 'homepage.features.subtasks.title',
        message: 'Sub-tasks Progress',
      }),
      description: translate({
        id: 'homepage.features.subtasks.description',
        message: 'Progress bars on parent cards for subtasks & epics.',
      }),
      link: '/docs/features/sub-tasks-progress',
    },
    {
      icon: '⏱',
      color: 'orange',
      title: translate({
        id: 'homepage.features.sla.title',
        message: 'Control Chart SLA',
      }),
      description: translate({
        id: 'homepage.features.sla.description',
        message: 'SLA reference line with percentile on Control Chart.',
      }),
      link: '/docs/features/control-chart/sla-line',
    },
    {
      icon: '⫸',
      color: 'red',
      title: translate({
        id: 'homepage.features.issueLinks.title',
        message: 'Issue Links Display',
      }),
      description: translate({
        id: 'homepage.features.issueLinks.description',
        message: 'Show blockers, parents & related issues on cards.',
      }),
      link: '/docs/features/card-information/issue-links-display',
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">
          <Translate id="homepage.features.title">Features</Translate>
        </h2>
        <p className="section__subtitle">
          <Translate id="homepage.features.subtitle">
            Everything you need for professional Kanban in Jira
          </Translate>
        </p>
        <div className="features-grid">
          {features.map((f, i) => (
            <Link key={i} href={f.link} className="feature-card">
              <div className={`feature-card__icon feature-card__icon--${f.color}`}>{f.icon}</div>
              <div>
                <div className="feature-card__title">{f.title}</div>
                <div className="feature-card__description">{f.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="section stats-section">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">19</span>
            <span className="stat-label">
              <Translate id="homepage.stats.features">Features</Translate>
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">58</span>
            <span className="stat-label">
              <Translate id="homepage.stats.releases">Releases</Translate>
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">2</span>
            <span className="stat-label">
              <Translate id="homepage.stats.languages">Languages</Translate>
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">ISC</span>
            <span className="stat-label">
              <Translate id="homepage.stats.openSource">Open Source</Translate>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="section cta-section">
      <div className="container" style={{textAlign: 'center'}}>
        <h2 className="section__title">
          <Translate id="homepage.cta.title">Install & Go</Translate>
        </h2>
        <p className="section__subtitle">
          <Translate id="homepage.cta.subtitle">
            No setup. No account. Just add to your browser and open Jira.
          </Translate>
        </p>
        <div className="hero__cta">
          <Link
            className="button button--secondary button--lg"
            href="https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl">
            Chrome Web Store
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://addons.mozilla.org/ru/firefox/addon/jira-helper-for-ff/">
            Firefox Add-ons
          </Link>
          <Link className="button button--primary button--lg" href="https://github.com/jira-helper/jira-helper">
            GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const title = translate({
    id: 'homepage.meta.title',
    message: 'Turn Jira into a real Kanban system',
  });
  const description = translate({
    id: 'homepage.meta.description',
    message: 'Browser extension with WIP limits, Gantt charts, and board visualization for Jira.',
  });

  return (
    <Layout title={title} description={description}>
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CtaSection />
    </Layout>
  );
}
