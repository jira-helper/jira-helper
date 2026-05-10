import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

function HeroSection() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="hero">
      <div className="container hero__inner">
        <div className="hero__text">
          <h1 className="hero__title">{siteConfig.tagline}</h1>
          <p className="hero__subtitle">
            Open-source browser extension. No servers, no accounts, no telemetry.
            Just professional Kanban — inside your existing Jira.
          </p>
          <div className="hero__cta">
            <Link className="button button--secondary button--lg"
              href="https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl">
              Add to Chrome — free
            </Link>
            <Link className="button button--outline button--lg"
              to="/docs/getting-started/installation">
              Documentation →
            </Link>
          </div>
        </div>
        <div className="hero__mockup">
          <div className="mockup-board">
            <div className="mockup-header">Jira Board — with jira-helper</div>
            <div className="mockup-columns">
              <div className="mockup-col mockup-col--full">
                <div className="mockup-col-header">To Do</div>
                <div className="mockup-card">TASK-101 Design</div>
                <div className="mockup-card">TASK-102 Research</div>
              </div>
              <div className="mockup-col-group mockup-wip">
                <div className="mockup-wip-badge">3 / 5</div>
                <div className="mockup-col mockup-col--group">
                  <div className="mockup-col-header">In Progress</div>
                  <div className="mockup-card"><span className="mockup-badge blue">3d</span> TASK-99 API</div>
                </div>
                <div className="mockup-col mockup-col--group">
                  <div className="mockup-col-header">Review</div>
                  <div className="mockup-card"><span className="mockup-badge green">1d</span> TASK-97 UI</div>
                  <div className="mockup-card"><span className="mockup-badge yellow">5d</span> TASK-95 Auth</div>
                </div>
              </div>
              <div className="mockup-col">
                <div className="mockup-col-header">Done</div>
                <div className="mockup-card">TASK-90 Docs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">Features</h2>
        <p className="section__subtitle">Everything you need for professional Kanban in Jira</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <Link key={i} href={f.link} className="feature-card">
              <div className={`feature-card__icon feature-card__icon--${f.color}`}>
                {f.icon}
              </div>
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

const features = [
  { icon: '≡', color: 'blue', title: 'Column WIP Limits', description: 'Group columns under shared limits. Visual alerts when exceeded.', link: '/docs/features/wip-limits/column-limits' },
  { icon: '◉', color: 'green', title: 'Personal WIP Limits', description: 'Per-person workload balance with avatar badges.', link: '/docs/features/wip-limits/personal-limits' },
  { icon: '↗', color: 'orange', title: 'Gantt Chart', description: 'Interactive timeline on issue pages. Zoom, pan, filters.', link: '/docs/features/gantt-chart' },
  { icon: '⬡', color: 'red', title: 'Card Colors', description: 'Full card highlighting via JQL — not just a thin strip.', link: '/docs/features/board-visualization/card-colors' },
  { icon: '◷', color: 'blue', title: 'Days in Column', description: 'See how long each issue sits in its current column.', link: '/docs/features/card-information/days-in-column' },
  { icon: '⏽', color: 'green', title: 'Sub-tasks Progress', description: 'Progress bars on parent cards for subtasks & epics.', link: '/docs/features/sub-tasks-progress' },
  { icon: '⏱', color: 'orange', title: 'Control Chart SLA', description: 'SLA reference line with percentile on Control Chart.', link: '/docs/features/control-chart/sla-line' },
  { icon: '⫸', color: 'red', title: 'Issue Links Display', description: 'Show blockers, parents & related issues on cards.', link: '/docs/features/card-information/issue-links-display' },
];

function StatsSection() {
  return (
    <section className="section stats-section">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">19</span>
            <span className="stat-label">Features</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">58</span>
            <span className="stat-label">Releases</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">2</span>
            <span className="stat-label">Languages</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">ISC</span>
            <span className="stat-label">Open Source</span>
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
        <h2 className="section__title">Install & Go</h2>
        <p className="section__subtitle">No setup. No account. Just add to your browser and open Jira.</p>
        <div className="hero__cta">
          <Link className="button button--secondary button--lg" href="https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl">Chrome Web Store</Link>
          <Link className="button button--secondary button--lg" href="https://addons.mozilla.org/firefox/addon/jira-helper/">Firefox Add-ons</Link>
          <Link className="button button--primary button--lg" href="https://github.com/jira-helper/jira-helper">GitHub</Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout title="Turn Jira into a real Kanban system" description="Browser extension with WIP limits, Gantt charts, and board visualization for Jira.">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CtaSection />
    </Layout>
  );
}
