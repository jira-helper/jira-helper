export function MockupCard({children, className}: {children: React.ReactNode; className?: string}) {
  return <div className={`mockup-card ${className ?? ''}`}>{children}</div>;
}
