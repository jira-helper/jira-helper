import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';

const features = [
  {
    icon: '🎯',
    title: 'Column WIP Limits',
    description: 'Group columns under shared WIP limits with visual feedback when exceeded.',
    link: '/docs/features/wip-limits/column-limits',
  },
  {
    icon: '👤',
    title: 'Personal WIP Limits',
    description: 'Balance workload with per-person limits. Avatar badges show current count.',
    link: '/docs/features/wip-limits/personal-limits',
  },
  {
    icon: '📊',
    title: 'Gantt Chart',
    description: 'Interactive Gantt chart on any issue page. Zoom, pan, quick filters.',
    link: '/docs/features/gantt-chart',
  },
  {
    icon: '🎨',
    title: 'Card Colors',
    description: 'Full card highlighting based on JQL — not just a thin left strip.',
    link: '/docs/features/board-visualization/card-colors',
  },
  {
    icon: '📅',
    title: 'Days in Column / Deadline',
    description: 'See how long issues sit in a column and days until due date.',
    link: '/docs/features/card-information/days-in-column',
  },
  {
    icon: '📈',
    title: 'Sub-tasks Progress',
    description: 'Progress bars on cards showing completion of subtasks and epics.',
    link: '/docs/features/sub-tasks-progress',
  },
  {
    icon: '⏱️',
    title: 'Control Chart SLA',
    description: 'SLA percentile line and measurement grids on Jira Control Chart.',
    link: '/docs/features/control-chart/sla-line',
  },
  {
    icon: '🔗',
    title: 'Issue Links Display',
    description: 'Show related issues (blockers, parents) directly on board cards.',
    link: '/docs/features/card-information/issue-links-display',
  },
];

function HeroSection() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <div className="hero">
      <h1 className="hero__title">{siteConfig.tagline}</h1>
      <p className="hero__subtitle">
        WIP limits • Board visualization • Gantt • Analytics — all inside your Jira.
      </p>
      <div className="hero__cta">
        <Link
          className="button button--secondary button--lg"
          href="https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl">
          Install from Chrome Web Store
        </Link>
        <Link
          className="button button--primary button--lg"
          to="/docs/getting-started/installation">
          Documentation
        </Link>
      </div>
    </div>
  );
}

function FeaturesGridSection() {
  return (
    <section style={{padding: '2rem 0'}}>
      <div className="container">
        <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Features</h2>
        <div className="features-grid">
          {features.map((f) => (
            <Link key={f.title} href={f.link} className="feature-card">
              <div className="feature-card__icon">{f.icon}</div>
              <div className="feature-card__title">{f.title}</div>
              <div className="feature-card__description">{f.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section style={{padding: '2rem 0', background: 'var(--ifm-color-emphasis-100)'}}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
          textAlign: 'center',
        }}>
          <div>
            <div style={{fontSize: '2.5rem', fontWeight: 700}}>19</div>
            <div>Features</div>
          </div>
          <div>
            <div style={{fontSize: '2.5rem', fontWeight: 700}}>2</div>
            <div>Languages</div>
          </div>
          <div>
            <div style={{fontSize: '2.5rem', fontWeight: 700}}>Open Source</div>
            <div>ISC License</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section style={{padding: '3rem 0', textAlign: 'center'}}>
      <div className="container">
        <h2>Get Started</h2>
        <p style={{marginBottom: '2rem'}}>
          Install the extension, explore the docs, or contribute on GitHub.
        </p>
        <div className="hero__cta">
          <Link className="button button--secondary button--lg" href="https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl">
            Chrome Web Store
          </Link>
          <Link className="button button--secondary button--lg" href="https://addons.mozilla.org/firefox/addon/jira-helper/">
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
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.tagline} description="Browser extension that turns Jira into a real Kanban system with WIP limits, Gantt charts, and board visualization.">
      <HeroSection />
      <FeaturesGridSection />
      <StatsSection />
      <CtaSection />
    </Layout>
  );
}
