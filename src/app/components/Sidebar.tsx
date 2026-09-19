import { NavLink } from 'react-router-dom';

const NAV_ITEMS: { to: string; label: string }[] = [
  { to: '/', label: 'Overview' },
  { to: '/upload', label: 'Upload Documents' },
  { to: '/documents', label: 'Documents' },
  { to: '/evidence', label: 'Evidence' },
  { to: '/findings', label: 'Findings' },
  { to: '/contradictions', label: 'Contradictions' },
  { to: '/requirements', label: 'Requirements' },
  { to: '/frameworks', label: 'Frameworks' },
  { to: '/agent-governance', label: 'Agent Governance' },
  { to: '/technical-translation', label: 'Technical Translation' },
  { to: '/reports', label: 'Reports' },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-line bg-ink-800 flex flex-col">
      <div className="px-5 py-5 border-b border-line">
        <div className="font-mono text-lg font-bold tracking-tight text-fg">POLICY//AUDIT</div>
        <div className="text-2xs text-fg-mute mt-1 leading-tight">
          AI GOVERNANCE DOCUMENT &amp; EVIDENCE AUDITOR
        </div>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `block px-5 py-2 text-sm border-l-2 transition-colors ${
                isActive
                  ? 'border-accent text-fg bg-ink-700'
                  : 'border-transparent text-fg-dim hover:text-fg hover:bg-ink-700/60'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-line text-2xs text-fg-mute mono">
        v0.1.0 &middot; local-first &middot; open source
      </div>
    </aside>
  );
}
