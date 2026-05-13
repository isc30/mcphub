import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Server } from '@/types';
import ServerCard from '@/components/ServerCard';
import AddServerForm from '@/components/AddServerForm';
import EditServerForm from '@/components/EditServerForm';
import { useServerData } from '@/hooks/useServerData';
import McpbUploadForm from '@/components/McpbUploadForm';
import JSONImportForm from '@/components/JSONImportForm';
import Pagination from '@/components/ui/Pagination';

type FilterKey = 'all' | 'online' | 'other';

const ServersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    servers,
    allServers,
    error,
    setError,
    isLoading,
    pagination,
    currentPage,
    serversPerPage,
    setCurrentPage,
    setServersPerPage,
    handleServerAdd,
    handleServerEdit,
    handleServerRemove,
    handleServerToggle,
    handleServerReload,
    triggerRefresh,
  } = useServerData({ refreshOnMount: true });

  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMcpbUpload, setShowMcpbUpload] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleEditClick = async (server: Server) => {
    const fullServerData = await handleServerEdit(server);
    if (fullServerData) setEditingServer(fullServerData);
  };

  const handleEditComplete = () => {
    setEditingServer(null);
    triggerRefresh();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      triggerRefresh();
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMcpbUploadSuccess = (_serverConfig: any) => {
    setShowMcpbUpload(false);
    triggerRefresh();
  };

  const handleJsonImportSuccess = () => {
    setShowJsonImport(false);
    triggerRefresh();
  };

  // Stats from allServers
  const totalOnline  = allServers.filter((s: Server) => s.status === 'connected').length;
  const totalOffline = allServers.filter((s: Server) => s.status !== 'connected').length;

  // Filter displayed servers
  const filteredServers = servers.filter((s: Server) => {
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'online' ? s.status === 'connected' :
      s.status !== 'connected';
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      (s.config?.description || '').toLowerCase().includes(q) ||
      (s.config?.type || '').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all',    label: t('common.all') || '全部',  count: allServers.length },
    { key: 'online', label: t('status.online') || '在线', count: totalOnline },
    { key: 'other',  label: t('status.offline') || '离线', count: totalOffline },
  ];

  return (
    <div className="scroll-pad page-fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 className="h-page">{t('pages.servers.title')}</h1>
          <p className="h-page-sub">
            {allServers.length} 个服务 · {totalOnline} 在线 · {allServers.filter((s: Server) => s.status !== 'connected' && s.enabled !== false).length} 离线
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowJsonImport(true)} className="ds-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>
            </svg>
            {t('jsonImport.button')}
          </button>
          <button onClick={() => setShowMcpbUpload(true)} className="ds-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {t('mcpb.upload')}
          </button>
          <AddServerForm onAdd={handleServerAdd} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-box" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--err)' }}>{error}</span>
          <button onClick={() => setError(null)} className="icon-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Filter + search toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 7, padding: 2, background: 'var(--surface)' }}>
          {filterTabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="ds-btn sm ghost"
              style={{
                background: filter === key ? 'var(--bg-2)' : 'transparent',
                color: filter === key ? 'var(--ink)' : 'var(--ink-3)',
                border: '1px solid ' + (filter === key ? 'var(--line)' : 'transparent'),
                height: 24, padding: '0 10px',
              }}
            >
              {label}
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 4 }}>{count}</span>
            </button>
          ))}
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', height: 30, flex: 1, maxWidth: 360 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-3)', flex: '0 0 13px' }}>
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            style={{ border: 0, padding: 0, height: 28, flex: 1, background: 'transparent', outline: 0, fontSize: 13, color: 'var(--ink)' }}
            placeholder={t('pages.servers.search') || '按名称、描述搜索…'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="ds-btn"
          style={{ opacity: isRefreshing ? 0.7 : 1 }}
        >
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: isRefreshing ? 'button-spinner 0.6s linear infinite' : undefined }}
          >
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>
          </svg>
          {t('common.refresh')}
        </button>

        <button onClick={() => navigate('/market')} className="ds-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8l1-4h16l1 4M3 8v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8M3 8h18"/>
          </svg>
          {t('nav.market')}
        </button>

        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)' }} className="mono">
          {filteredServers.length} / {allServers.length}
        </div>
      </div>

      {/* Server list */}
      {isLoading ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
          {t('app.loading')}
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', border: '1px dashed var(--line)' }}>
          <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>{t('app.noServers')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredServers.map((server: Server, index: number) => (
            <ServerCard
              key={index}
              server={server}
              onRemove={handleServerRemove}
              onEdit={handleEditClick}
              onToggle={handleServerToggle}
              onRefresh={triggerRefresh}
              onReload={handleServerReload}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredServers.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }} className="mono">
            {pagination
              ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} / ${pagination.total}`
              : `1–${servers.length} / ${servers.length}`}
          </span>
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
              disabled={isLoading}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>每页</span>
            <select
              value={serversPerPage}
              onChange={(e) => setServersPerPage(Number(e.target.value))}
              disabled={isLoading}
              className="ds-input"
              style={{ width: 72, height: 28, fontSize: 12 }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* Hint footer */}
      <div style={{ marginTop: 16, padding: 14, border: '1px dashed var(--line)', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center', color: 'var(--ink-3)', fontSize: 12.5 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L4 14h7l-1 8 9-12h-7z"/>
        </svg>
        <span>
          支持热添加 / 热移除服务，无需重启 MCPHub。配置默认存储于
          <span className="mono" style={{ color: 'var(--ink-2)', margin: '0 4px' }}>mcp_settings.json</span>，开启数据库模式后会同步到 PostgreSQL。
        </span>
      </div>

      {/* Modals */}
      {editingServer && (
        <EditServerForm
          server={editingServer}
          onEdit={handleEditComplete}
          onCancel={() => setEditingServer(null)}
        />
      )}
      {showMcpbUpload && (
        <McpbUploadForm
          onSuccess={handleMcpbUploadSuccess}
          onCancel={() => setShowMcpbUpload(false)}
        />
      )}
      {showJsonImport && (
        <JSONImportForm
          onSuccess={handleJsonImportSuccess}
          onCancel={() => setShowJsonImport(false)}
        />
      )}
    </div>
  );
};

export default ServersPage;
