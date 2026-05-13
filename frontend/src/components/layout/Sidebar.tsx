import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionCheck } from '../PermissionChecker';
import UserProfileMenu from '@/components/ui/UserProfileMenu';
import { checkActivityAvailable } from '@/services/activityService';
import { MessageSquare, FileText } from 'lucide-react';

const appVersion = import.meta.env.PACKAGE_VERSION as string;

// Inline SVG icons matching the design
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);
const ServerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/>
    <circle cx="7" cy="7.5" r="0.6" fill="currentColor"/><circle cx="7" cy="16.5" r="0.6" fill="currentColor"/>
  </svg>
);
const GroupsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><circle cx="12" cy="17" r="3"/>
    <path d="M9 10l3 4M15 10l-3 4"/>
  </svg>
);
const StoreIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l1-4h16l1 4M3 8v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8M3 8h18"/>
    <path d="M8 8v3a2 2 0 1 0 4 0V8M12 8v3a2 2 0 1 0 4 0V8"/>
  </svg>
);
const KeyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l3 3"/>
  </svg>
);
const DocIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
  </svg>
);
const ActivityIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
  </svg>
);

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ReactNode;
  badge?: string;
}

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { auth } = useAuth();
  const location = useLocation();
  const [activityAvailable, setActivityAvailable] = useState(false);

  useEffect(() => {
    checkActivityAvailable()
      .then(setActivityAvailable)
      .catch(() => setActivityAvailable(false));
  }, []);

  const mainNav: NavItem[] = [
    { path: '/',        labelKey: 'nav.dashboard', icon: <GridIcon /> },
    { path: '/servers', labelKey: 'nav.servers',   icon: <ServerIcon /> },
    { path: '/groups',  labelKey: 'nav.groups',    icon: <GroupsIcon /> },
    { path: '/market',  labelKey: 'nav.market',    icon: <StoreIcon /> },
    { path: '/prompts', labelKey: 'nav.prompts',   icon: <MessageSquare size={15} /> },
    { path: '/resources', labelKey: 'nav.resources', icon: <FileText size={15} /> },
  ];

  const systemNav: NavItem[] = [
    ...(auth.user?.isAdmin && usePermissionCheck('x')
      ? [{ path: '/users', labelKey: 'nav.users', icon: <UsersIcon /> }]
      : []),
    ...(activityAvailable && auth.user?.isAdmin
      ? [{ path: '/activity', labelKey: 'nav.activity', icon: <ActivityIcon /> }]
      : []),
    { path: '/logs',     labelKey: 'nav.logs',     icon: <DocIcon /> },
    { path: '/settings', labelKey: 'nav.settings', icon: <SettingsIcon /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sb">
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-logo">
          <span style={{ position: 'relative', display: 'inline-block' }}>
            M
            <span style={{
              position: 'absolute', right: -3, bottom: -1,
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--ok)',
              boxShadow: '0 0 0 2px oklch(0.66 0.15 145 / 0.18)',
            }} />
          </span>
        </div>
        <div className="sb-title">
          MCPHub
          <small>{appVersion === 'dev' ? appVersion : `v${appVersion}`}</small>
        </div>
      </div>

      {/* Search */}
      <div className="sb-search">
        <div className="sb-search-box">
          <SearchIcon />
          <span style={{ flex: 1, fontSize: 12.5 }}>搜索…</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 11, padding: '1px 5px',
            border: '1px solid var(--line)', borderRadius: 4, color: 'var(--ink-3)',
            background: 'var(--surface)',
          }}>⌘K</span>
        </div>
      </div>

      {/* Scrollable navigation */}
      <div className="sb-scroll">
        <div className="sb-sect">工作区</div>
        <nav className="sb-nav">
          {mainNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={() => `sb-item${isActive(item.path) ? ' active' : ''}`}
            >
              <span className="icn">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sb-sect">系统</div>
        <nav className="sb-nav">
          {systemNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={() => `sb-item${isActive(item.path) ? ' active' : ''}`}
            >
              <span className="icn">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User footer */}
      <div className="sb-foot">
        <UserProfileMenu collapsed={false} version={appVersion} />
      </div>
    </aside>
  );
};

export default Sidebar;
