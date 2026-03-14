import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ClipboardList, Wrench, BarChart3, Share2, ScanLine } from 'lucide-react';
import { getUnsyncedMatchEntries, getUnsyncedPitEntries } from '@/lib/storage';

const tabs = [
  { to: '/', label: 'Scout', icon: ClipboardList },
  { to: '/pit', label: 'Pit', icon: Wrench },
  { to: '/data', label: 'Data', icon: BarChart3 },
  { to: '/share', label: 'Share', icon: Share2 },
  { to: '/receive', label: 'Receive', icon: ScanLine },
];

export default function AppNav() {
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    const count =
      getUnsyncedMatchEntries().length + getUnsyncedPitEntries().length;
    setUnsyncedCount(count);
  }, []);

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
                `relative flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-100 ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
              {to === '/share' && unsyncedCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unsyncedCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
