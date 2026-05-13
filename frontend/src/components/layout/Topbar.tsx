import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, BookOpen } from 'lucide-react';
import ThemeSwitch from '@/components/ui/ThemeSwitch';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import GitHubIcon from '@/components/icons/GitHubIcon';
import { useEmbeddingSync } from '@/contexts/EmbeddingSyncContext';

const ROUTE_LABELS: Record<string, string> = {
  '/':          'nav.dashboard',
  '/servers':   'nav.servers',
  '/groups':    'nav.groups',
  '/market':    'nav.market',
  '/prompts':   'nav.prompts',
  '/resources': 'nav.resources',
  '/users':     'nav.users',
  '/logs':      'nav.logs',
  '/activity':  'nav.activity',
  '/settings':  'nav.settings',
};

const Topbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { activeSyncs } = useEmbeddingSync();

  const basePath = '/' + location.pathname.split('/')[1];
  const pageLabel = t(ROUTE_LABELS[basePath] || ROUTE_LABELS['/']);

  return (
    <div className="topbar">
      <div className="crumb">
        <span>MCPHub</span>
        <span className="sep">/</span>
        <b>{pageLabel}</b>
      </div>

      {/* Embedding sync indicator */}
      {activeSyncs.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {activeSyncs.map((s) => (
            <div
              key={s.serverName}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 10px', borderRadius: 7,
                background: 'var(--accent-soft)', border: '1px solid var(--accent)',
                fontSize: 12, color: 'var(--accent)',
              }}
            >
              <span style={{ fontFamily: 'var(--mono)' }}>{s.serverName}</span>
              <progress
                style={{ width: 60, height: 3 }}
                value={s.current}
                max={s.total}
              />
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{s.current}/{s.total}</span>
            </div>
          ))}
        </div>
      )}

      <div className="top-actions">
        <span
          className="ds-pill ok"
          style={{ marginRight: 4, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <span className="d" /> 系统正常
        </span>

        <a
          href="https://github.com/samanhappy/mcphub"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-btn"
          aria-label="GitHub"
        >
          <GitHubIcon style={{ width: 15, height: 15 }} />
        </a>

        <a
          href="https://docs.mcphub.app"
          target="_blank"
          rel="noopener noreferrer"
          className="icon-btn"
          aria-label="Documentation"
        >
          <BookOpen size={15} />
        </a>

        <ThemeSwitch />
        <LanguageSwitch />
      </div>
    </div>
  );
};

export default Topbar;
