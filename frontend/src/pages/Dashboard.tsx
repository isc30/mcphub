import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useServerData } from '@/hooks/useServerData';
import { Server } from '@/types';
import { Endpoint, StatPill } from '@/components/ui/DesignPrimitives';
import { getBasePath } from '@/utils/runtime';

// Static sparkline seeds for demo aesthetics
const STAT_SPARK_ONLINE  = [2,3,4,4,3,4,4,4,5,4,4,4];
const STAT_SPARK_OFFLINE = [0,1,0,1,1,0,2,1,0,1,1,1];

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { allServers, isLoading } = useServerData({ refreshOnMount: true });
  const online    = allServers.filter((s: Server) => s.status === 'connected').length;
  const offline   = allServers.filter((s: Server) => s.status === 'disconnected' && s.enabled !== false).length;
  const disabled  = allServers.filter((s: Server) => s.enabled === false).length;
  const connecting = allServers.filter((s: Server) => s.status === 'connecting').length;

  const baseUrl = window.location.origin + getBasePath();

  const statusLabel = (s: Server) => {
    if (s.status === 'connected') return { cls: 'ok', text: t('status.online') };
    if (s.status === 'connecting') return { cls: 'warn', text: t('status.connecting') };
    if (s.status === 'oauth_required') return { cls: 'warn', text: t('status.oauthRequired') };
    return { cls: s.enabled === false ? 'muted' : 'err', text: s.enabled === false ? t('status.disabled') : t('status.offline') };
  };

  return (
    <div className="scroll-pad page-fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 className="h-page">概览</h1>
          <p className="h-page-sub">
            {online} 服务在线 · {allServers.length} 服务总计
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/servers" className="ds-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/>
            </svg>
            管理服务器
          </Link>
          <Link to="/servers" className="ds-btn primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            添加服务器
          </Link>
        </div>
      </div>

      {/* Endpoints */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 className="h-card">MCP 接入端点</h3>
            <p style={{ color: 'var(--ink-3)', fontSize: 12, margin: '2px 0 0' }}>
              把这些 URL 配到 Claude Desktop / Cursor 等客户端即可使用
            </p>
          </div>
          <a
            href="https://docs.mcphub.app"
            target="_blank"
            rel="noopener noreferrer"
            className="ds-btn ghost"
            style={{ color: 'var(--ink-3)' }}
          >
            查看 API 文档
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M10 14L21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>
            </svg>
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Endpoint label="ALL"    url={`${baseUrl}/mcp`} />
          <Endpoint label="SMART"  url={`${baseUrl}/mcp/$smart`} />
          <Endpoint label="GROUP"  url={`${baseUrl}/mcp/{group}`} />
          <Endpoint label="SERVER" url={`${baseUrl}/mcp/{server}`} />
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatPill
          label="活跃服务器"
          value={`${online}/${allServers.length}`}
          delta={String(online)}
          deltaKind="up"
          spark={STAT_SPARK_ONLINE}
          sparkColor="oklch(0.66 0.15 145)"
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/>
            </svg>
          }
        />
        <StatPill
          label="工具总数"
          value={allServers.reduce((a: number, s: Server) => a + (s.tools?.length || 0), 0).toLocaleString()}
          spark={[12,15,14,18,22,20,24,28,26,30,32,35]}
          sparkColor="var(--accent)"
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2z"/>
            </svg>
          }
        />
        <StatPill
          label="离线 / 异常"
          value={offline + connecting}
          spark={STAT_SPARK_OFFLINE}
          sparkColor={offline + connecting > 0 ? 'oklch(0.62 0.18 25)' : 'oklch(0.66 0.15 145)'}
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          }
        />
        <StatPill
          label="已禁用"
          value={disabled}
          spark={[0,0,0,0,0,0,0,0,0,0,0,disabled]}
          sparkColor="var(--ink-3)"
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"/>
              <rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"/>
            </svg>
          }
        />
      </div>

      {/* Servers table */}
      {allServers.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="h-card">服务器</h3>
            <Link to="/servers" className="ds-btn sm ghost" style={{ color: 'var(--ink-3)' }}>
              全部
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>加载中…</div>
          ) : (
            <div>
              <div className="ds-row head" style={{ gridTemplateColumns: '1.6fr 90px 70px 70px 80px', borderRadius: 0 }}>
                <div>名称</div><div>状态</div><div>工具</div><div>Prompts</div><div>启用</div>
              </div>
              {allServers.slice(0, 8).map((server: Server, i: number) => {
                const st = statusLabel(server);
                return (
                  <div key={i} className="ds-row hover" style={{ gridTemplateColumns: '1.6fr 90px 70px 70px 80px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', flex: '0 0 6px',
                        background: st.cls === 'ok' ? 'var(--ok)' : st.cls === 'warn' ? 'var(--warn)' : st.cls === 'err' ? 'var(--err)' : 'var(--ink-3)',
                      }} />
                      <span className="mono" style={{ fontSize: 13 }}>{server.name}</span>
                      {server.config?.description && (
                        <span style={{ fontSize: 11.5, color: 'var(--ink-3)', marginLeft: 4 }}>{server.config.description}</span>
                      )}
                    </div>
                    <div>
                      <span className={`ds-pill ${st.cls}`}>
                        <span className="d" />{st.text}
                      </span>
                    </div>
                    <div className="num mono" style={{ fontSize: 12.5 }}>{server.tools?.length || 0}</div>
                    <div className="num mono" style={{ fontSize: 12.5 }}>{server.prompts?.length || 0}</div>
                    <div>
                      {server.enabled !== false ? (
                        <span style={{ color: 'var(--ok)', fontSize: 12 }}>启用</span>
                      ) : (
                        <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>禁用</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {allServers.length === 0 && !isLoading && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--line)' }}>
          <div style={{ marginBottom: 12, color: 'var(--ink-3)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
              <rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/>
            </svg>
          </div>
          <p style={{ color: 'var(--ink-2)', fontWeight: 500, marginBottom: 4 }}>暂无服务器</p>
          <p style={{ color: 'var(--ink-3)', fontSize: 12.5, marginBottom: 16 }}>添加你的第一个 MCP 服务开始使用</p>
          <Link to="/servers" className="ds-btn primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            添加服务器
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
