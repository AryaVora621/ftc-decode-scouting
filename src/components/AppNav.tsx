import { NavLink } from 'react-router-dom';
import { ClipboardList, Wrench, BarChart3 } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Scout', icon: ClipboardList },
  { to: '/pit', label: 'Pit', icon: Wrench },
  { to: '/data', label: 'Data', icon: BarChart3 },
];

export default function AppNav() {
  return (
    <nav className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center gap-1 py-2">
        <span className="font-display text-xl font-bold text-primary mr-4 tracking-tight">FTC Scout</span>
        <div className="flex gap-1">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-100 ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
