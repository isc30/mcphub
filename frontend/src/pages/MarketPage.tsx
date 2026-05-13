import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  MarketServer,
  CloudServer,
  ServerConfig,
  RegistryServerEntry,
  RegistryServerData,
} from '@/types';
import { useMarketData } from '@/hooks/useMarketData';
import { useCloudData } from '@/hooks/useCloudData';
import { useRegistryData } from '@/hooks/useRegistryData';
import { useToast } from '@/contexts/ToastContext';
import { apiPost } from '@/utils/fetchInterceptor';
import MarketServerCard from '@/components/MarketServerCard';
import MarketServerDetail from '@/components/MarketServerDetail';
import CloudServerCard from '@/components/CloudServerCard';
import CloudServerDetail from '@/components/CloudServerDetail';
import RegistryServerCard from '@/components/RegistryServerCard';
import RegistryServerDetail from '@/components/RegistryServerDetail';
import MCPRouterApiKeyError from '@/components/MCPRouterApiKeyError';
import Pagination from '@/components/ui/Pagination';
import CursorPagination from '@/components/ui/CursorPagination';

const MarketPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { serverName } = useParams<{ serverName?: string }>();
  const { showToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'cloud';

  const {
    servers: localServers,
    allServers: allLocalServers,
    categories: localCategories,
    loading: localLoading,
    error: localError,
    setError: setLocalError,
    searchServers: searchLocalServers,
    filterByCategory: filterLocalByCategory,
    filterByTag: filterLocalByTag,
    selectedCategory: selectedLocalCategory,
    selectedTag: selectedLocalTag,
    installServer: installLocalServer,
    fetchServerByName: fetchLocalServerByName,
    isServerInstalled,
    currentPage: localCurrentPage,
    totalPages: localTotalPages,
    changePage: changeLocalPage,
    serversPerPage: localServersPerPage,
    changeServersPerPage: changeLocalServersPerPage,
  } = useMarketData();

  const {
    servers: cloudServers,
    allServers: allCloudServers,
    loading: cloudLoading,
    error: cloudError,
    setError: setCloudError,
    fetchServerTools,
    callServerTool,
    currentPage: cloudCurrentPage,
    totalPages: cloudTotalPages,
    changePage: changeCloudPage,
    serversPerPage: cloudServersPerPage,
    changeServersPerPage: changeCloudServersPerPage,
  } = useCloudData();

  const {
    servers: registryServers,
    allServers: allRegistryServers,
    loading: registryLoading,
    error: registryError,
    setError: setRegistryError,
    searchServers: searchRegistryServers,
    clearSearch: clearRegistrySearch,
    fetchServerByName: fetchRegistryServerByName,
    fetchServerVersions: fetchRegistryServerVersions,
    currentPage: registryCurrentPage,
    totalPages: registryTotalPages,
    hasNextPage: registryHasNextPage,
    hasPreviousPage: registryHasPreviousPage,
    changePage: changeRegistryPage,
    goToNextPage: goToRegistryNextPage,
    goToPreviousPage: goToRegistryPreviousPage,
    serversPerPage: registryServersPerPage,
    changeServersPerPage: changeRegistryServersPerPage,
  } = useRegistryData();

  const [selectedServer, setSelectedServer] = useState<MarketServer | null>(null);
  const [selectedCloudServer, setSelectedCloudServer] = useState<CloudServer | null>(null);
  const [selectedRegistryServer, setSelectedRegistryServer] = useState<RegistryServerEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [registrySearchQuery, setRegistrySearchQuery] = useState('');
  const [installing, setInstalling] = useState(false);
  const [installedCloudServers, setInstalledCloudServers] = useState<Set<string>>(new Set());
  const [installedRegistryServers, setInstalledRegistryServers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      if (!serverName) {
        setSelectedServer(null);
        setSelectedCloudServer(null);
        setSelectedRegistryServer(null);
        return;
      }
      if (currentTab === 'cloud') {
        const s = cloudServers.find((x) => x.name === serverName);
        if (s) setSelectedCloudServer(s);
        else navigate('/market?tab=cloud');
      } else if (currentTab === 'registry') {
        const s = await fetchRegistryServerByName(serverName);
        if (s) setSelectedRegistryServer(s);
        else navigate('/market?tab=registry');
      } else {
        const s = await fetchLocalServerByName(serverName);
        if (s) setSelectedServer(s);
        else navigate('/market?tab=local');
      }
    };
    load();
  }, [serverName, currentTab, cloudServers, fetchLocalServerByName, fetchRegistryServerByName, navigate]);

  const switchTab = (tab: 'local' | 'cloud' | 'registry') => {
    const p = new URLSearchParams(searchParams);
    p.set('tab', tab);
    setSearchParams(p);
    if (serverName) navigate('/market?' + p.toString());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTab === 'local') searchLocalServers(searchQuery);
    else if (currentTab === 'registry') searchRegistryServers(registrySearchQuery);
  };

  const handleClearFilters = () => {
    if (currentTab === 'local') {
      setSearchQuery('');
      filterLocalByCategory('');
      filterLocalByTag('');
    } else if (currentTab === 'registry') {
      setRegistrySearchQuery('');
      clearRegistrySearch();
    }
  };

  const handleServerClick = (server: MarketServer | CloudServer | RegistryServerEntry) => {
    if (currentTab === 'cloud') {
      navigate(`/market/${(server as CloudServer).name}?tab=cloud`);
    } else if (currentTab === 'registry') {
      const name = (server as RegistryServerEntry).server?.name;
      if (name) navigate(`/market/${encodeURIComponent(name)}?tab=registry`);
    } else {
      navigate(`/market/${(server as MarketServer).name}?tab=local`);
    }
  };

  const handleBackToList = () => navigate(`/market?tab=${currentTab}`);

  const handleLocalInstall = async (server: MarketServer, config: ServerConfig) => {
    try {
      setInstalling(true);
      const ok = await installLocalServer(server, config);
      if (ok) showToast(t('market.installSuccess', { serverName: server.display_name }), 'success');
    } finally { setInstalling(false); }
  };

  const handleCloudInstall = async (server: CloudServer, config: ServerConfig) => {
    try {
      setInstalling(true);
      const result = await apiPost('/servers', { name: server.name, config });
      if (!result.success) { showToast(result?.message || t('server.addError'), 'error'); return; }
      setInstalledCloudServers((p) => new Set(p).add(server.name));
      showToast(t('cloud.installSuccess', { name: server.title || server.name }), 'success');
    } catch (e) {
      showToast(t('cloud.installError', { error: e instanceof Error ? e.message : String(e) }), 'error');
    } finally { setInstalling(false); }
  };

  const handleRegistryInstall = async (server: RegistryServerData, config: ServerConfig) => {
    try {
      setInstalling(true);
      const result = await apiPost('/servers', { name: server.name, config });
      if (!result.success) { showToast(result?.message || t('server.addError'), 'error'); return; }
      setInstalledRegistryServers((p) => new Set(p).add(server.name));
      showToast(t('registry.installSuccess', { name: server.title || server.name }), 'success');
    } catch (e) {
      showToast(t('registry.installError', { error: e instanceof Error ? e.message : String(e) }), 'error');
    } finally { setInstalling(false); }
  };

  const handleCallTool = async (sName: string, toolName: string, args: Record<string, any>) => {
    try {
      const result = await callServerTool(sName, toolName, args);
      showToast(t('cloud.toolCallSuccess', { toolName }), 'success');
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!isMCPRouterApiKeyError(msg)) showToast(t('cloud.toolCallError', { toolName, error: msg }), 'error');
      throw e;
    }
  };

  const isMCPRouterApiKeyError = (msg: string) =>
    msg === 'MCPROUTER_API_KEY_NOT_CONFIGURED' || msg.toLowerCase().includes('mcprouter api key not configured');

  const handlePageChange = (page: number) => {
    if (currentTab === 'local') changeLocalPage(page);
    else if (currentTab === 'registry') changeRegistryPage(page);
    else changeCloudPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeItemsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = parseInt(e.target.value, 10);
    if (currentTab === 'local') changeLocalServersPerPage(v);
    else if (currentTab === 'registry') changeRegistryServersPerPage(v);
    else changeCloudServersPerPage(v);
  };

  // Detail views
  if (selectedServer) return <MarketServerDetail server={selectedServer} onBack={handleBackToList} onInstall={handleLocalInstall} installing={installing} isInstalled={isServerInstalled(selectedServer.name)} />;
  if (selectedCloudServer) return <CloudServerDetail serverName={selectedCloudServer.name} onBack={handleBackToList} onCallTool={handleCallTool} fetchServerTools={fetchServerTools} onInstall={handleCloudInstall} installing={installing} isInstalled={installedCloudServers.has(selectedCloudServer.name)} />;
  if (selectedRegistryServer) return <RegistryServerDetail serverEntry={selectedRegistryServer} onBack={handleBackToList} onInstall={handleRegistryInstall} installing={installing} isInstalled={installedRegistryServers.has(selectedRegistryServer.server.name)} fetchVersions={fetchRegistryServerVersions} />;

  const isLocalTab    = currentTab === 'local';
  const isRegistryTab = currentTab === 'registry';
  const servers    = isLocalTab ? localServers    : isRegistryTab ? registryServers    : cloudServers;
  const allServers = isLocalTab ? allLocalServers : isRegistryTab ? allRegistryServers : allCloudServers;
  const categories = isLocalTab ? localCategories : [];
  const loading    = isLocalTab ? localLoading    : isRegistryTab ? registryLoading    : cloudLoading;
  const error      = isLocalTab ? localError      : isRegistryTab ? registryError      : cloudError;
  const setError   = isLocalTab ? setLocalError   : isRegistryTab ? setRegistryError   : setCloudError;
  const selectedCategory = isLocalTab ? selectedLocalCategory : '';
  const currentPage  = isLocalTab ? localCurrentPage  : isRegistryTab ? registryCurrentPage  : cloudCurrentPage;
  const totalPages   = isLocalTab ? localTotalPages   : isRegistryTab ? registryTotalPages   : cloudTotalPages;
  const serversPerPage = isLocalTab ? localServersPerPage : isRegistryTab ? registryServersPerPage : cloudServersPerPage;

  const tabDefs = [
    { key: 'cloud',    label: t('cloud.title'),    href: 'https://mcprouter.co', hrefLabel: 'MCPRouter' },
    { key: 'local',    label: t('market.title'),   href: 'https://mcpm.sh',      hrefLabel: 'MCPM' },
    { key: 'registry', label: t('registry.title'), href: 'https://registry.modelcontextprotocol.io', hrefLabel: t('registry.official') },
  ];

  return (
    <div className="scroll-pad page-fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 className="h-page">{t('nav.market')}</h1>
          <p className="h-page-sub">
            {isLocalTab ? `${allLocalServers.length} 个开源 MCP 服务 · 一键安装到本控制台` :
             isRegistryTab ? `MCP 官方注册表` :
             `MCPRouter 云端服务 · ${allCloudServers.length} 可用`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={isLocalTab ? 'https://mcpm.sh' : isRegistryTab ? 'https://registry.modelcontextprotocol.io' : 'https://mcprouter.co'}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-btn ghost"
            style={{ color: 'var(--ink-3)' }}
          >
            {isLocalTab ? '浏览 mcpm.sh' : isRegistryTab ? '浏览注册表' : '浏览 MCPRouter'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M10 14L21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 20, borderBottom: '1px solid var(--line)' }}>
        {tabDefs.map(({ key, label, href, hrefLabel }) => (
          <button
            key={key}
            onClick={() => switchTab(key as any)}
            style={{
              padding: '8px 14px',
              fontSize: 13.5,
              fontWeight: 500,
              color: currentTab === key ? 'var(--ink)' : 'var(--ink-3)',
              borderBottom: currentTab === key ? '2px solid var(--ink)' : '2px solid transparent',
              marginBottom: -1,
              background: 'transparent',
              transition: 'color 0.12s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {label}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}
            >
              {hrefLabel}
            </a>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 16 }}>
          {!isLocalTab && isMCPRouterApiKeyError(error) ? (
            <MCPRouterApiKeyError />
          ) : (
            <div className="error-box" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--err)' }}>{error}</span>
              <button onClick={() => setError(null)} className="icon-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search bar */}
      {(isLocalTab || isRegistryTab) && (
        <div className="card" style={{ padding: 6, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-3)', margin: '0 6px 0 10px', flex: '0 0 16px' }}>
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              style={{ flex: 1, height: 38, border: 0, background: 'transparent', outline: 0, fontSize: 14, color: 'var(--ink)' }}
              placeholder={isRegistryTab ? t('registry.searchPlaceholder') : t('market.searchPlaceholder')}
              value={isRegistryTab ? registrySearchQuery : searchQuery}
              onChange={(e) => isRegistryTab ? setRegistrySearchQuery(e.target.value) : setSearchQuery(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 4, padding: '0 4px' }}>
              <button type="submit" className="ds-btn sm">
                {isRegistryTab ? t('registry.search') : t('market.search')}
              </button>
              {((isLocalTab && (searchQuery || selectedCategory)) ||
                (isRegistryTab && registrySearchQuery)) && (
                <button type="button" onClick={handleClearFilters} className="ds-btn sm ghost">
                  {isRegistryTab ? t('registry.clearFilters') : t('market.clearFilters')}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isLocalTab && categories.length > 0 ? '180px 1fr' : '1fr', gap: 20 }}>
        {/* Categories sidebar */}
        {isLocalTab && categories.length > 0 && (
          <div>
            <h3 className="h-sect" style={{ marginBottom: 8 }}>{t('market.categories')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => filterLocalByCategory(category === selectedCategory ? '' : category)}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 6, fontSize: 13,
                    background: selectedCategory === category ? 'var(--surface)' : 'transparent',
                    color: selectedCategory === category ? 'var(--ink)' : 'var(--ink-2)',
                    border: '1px solid ' + (selectedCategory === category ? 'var(--line)' : 'transparent'),
                    textAlign: 'left',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main grid */}
        <div>
          {loading ? (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              {t('app.loading')}
            </div>
          ) : servers.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                {isLocalTab ? t('market.noServers') : isRegistryTab ? t('registry.noServers') : t('cloud.noServers')}
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {servers.map((server, i) =>
                  isLocalTab ? (
                    <MarketServerCard key={i} server={server as MarketServer} onClick={handleServerClick} />
                  ) : isRegistryTab ? (
                    <RegistryServerCard key={i} serverEntry={server as RegistryServerEntry} onClick={handleServerClick} />
                  ) : (
                    <CloudServerCard key={i} server={server as CloudServer} onClick={handleServerClick} />
                  ),
                )}
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }} className="mono">
                  {isLocalTab
                    ? `${(currentPage - 1) * serversPerPage + 1}–${Math.min(currentPage * serversPerPage, allServers.length)} / ${allServers.length}`
                    : isRegistryTab
                    ? `${(currentPage - 1) * serversPerPage + 1}–${(currentPage - 1) * serversPerPage + servers.length} / ${allServers.length}${registryHasNextPage ? '+' : ''}`
                    : `${(currentPage - 1) * serversPerPage + 1}–${Math.min(currentPage * serversPerPage, allServers.length)} / ${allServers.length}`}
                </span>

                {isRegistryTab ? (
                  <CursorPagination
                    currentPage={currentPage}
                    hasNextPage={registryHasNextPage}
                    hasPreviousPage={registryHasPreviousPage}
                    onNextPage={goToRegistryNextPage}
                    onPreviousPage={goToRegistryPreviousPage}
                  />
                ) : (
                  totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  )
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>每页</span>
                  <select
                    value={serversPerPage}
                    onChange={handleChangeItemsPerPage}
                    className="ds-input"
                    style={{ width: 72, height: 28, fontSize: 12 }}
                  >
                    <option value="6">6</option>
                    <option value="9">9</option>
                    <option value="12">12</option>
                    <option value="24">24</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
