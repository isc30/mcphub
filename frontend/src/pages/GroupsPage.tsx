import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Server, IGroupServerConfig } from '@/types';
import { useGroupData } from '@/hooks/useGroupData';
import { useServerData } from '@/hooks/useServerData';
import AddGroupForm from '@/components/AddGroupForm';
import EditGroupForm from '@/components/EditGroupForm';
import GroupImportForm from '@/components/GroupImportForm';
import TemplateExportForm from '@/components/TemplateExportForm';
import TemplateImportForm from '@/components/TemplateImportForm';
import { Endpoint } from '@/components/ui/DesignPrimitives';
import { getBasePath } from '@/utils/runtime';

// ── Group card component ─────────────────────────────────────────────────
interface GroupCardProps {
  group: Group;
  servers: Server[];
  onEdit: (g: Group) => void;
  onDelete: (id: string) => void;
}

const GroupCardItem: React.FC<GroupCardProps> = ({ group, servers, onEdit, onDelete }) => {
  const basePath = getBasePath();
  const endpointUrl = `${window.location.origin}${basePath}/mcp/${group.name}`;

  const serverNames: string[] = group.servers.map((s) =>
    typeof s === 'string' ? s : (s as IGroupServerConfig).name,
  );

  const serverStatuses = serverNames.map((name) => {
    const found = servers.find((sv) => sv.name === name);
    return {
      name,
      status: found?.status,
      tools: found?.tools?.length || 0,
      prompts: found?.prompts?.length || 0,
    };
  });

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{group.name}</span>
            <span className="mono" style={{
              fontSize: 11, color: 'var(--ink-3)', padding: '0 6px',
              border: '1px solid var(--line)', borderRadius: 4, height: 18,
              display: 'inline-flex', alignItems: 'center',
            }}>{group.id.slice(0, 12)}…</span>
          </div>
          {group.description && (
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{group.description}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button className="icon-btn" onClick={() => onEdit(group)} title="编辑">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3l7 7-11 11H3v-7z"/><path d="M13 4l7 7"/>
            </svg>
          </button>
          <button className="icon-btn" onClick={() => onDelete(group.id)} title="删除" style={{ color: 'var(--err)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Routing diagram */}
      <div style={{ padding: '14px 16px 16px', display: 'grid', gridTemplateColumns: '1fr 60px 1fr', alignItems: 'center', gap: 10 }}>
        {/* Left: servers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {serverStatuses.length === 0 ? (
            <div style={{ padding: '8px 10px', background: 'var(--bg-2)', border: '1px dashed var(--line)', borderRadius: 7, fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
              无服务
            </div>
          ) : (
            serverStatuses.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 7 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', flex: '0 0 6px',
                  background: s.status === 'connected' ? 'var(--ok)' : s.status === 'connecting' ? 'var(--warn)' : 'var(--err)',
                }} />
                <span className="mono" style={{ fontSize: 12.5, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', flexShrink: 0 }}>{s.tools}T</span>
              </div>
            ))
          )}
        </div>

        {/* Center: arrow */}
        <svg width="60" height={Math.max(40, serverStatuses.length * 40)} viewBox={`0 0 60 ${Math.max(40, serverStatuses.length * 40)}`} style={{ alignSelf: 'center' }}>
          {serverStatuses.length === 0 ? (
            <path d="M0,20 C 20,20 40,20 60,20" stroke="var(--line)" strokeWidth="1" fill="none" strokeDasharray="3 3" />
          ) : (
            serverStatuses.map((_, i) => {
              const h = Math.max(40, serverStatuses.length * 40);
              const y1 = (h / serverStatuses.length) * (i + 0.5);
              const mid = h / 2;
              return <path key={i} d={`M0,${y1} C 20,${y1} 40,${mid} 60,${mid}`} stroke="var(--line)" strokeWidth="1" fill="none" strokeDasharray="3 3" />;
            })
          )}
          <circle cx="60" cy={Math.max(40, serverStatuses.length * 40) / 2} r="4" fill="var(--ink)" />
        </svg>

        {/* Right: endpoint */}
        <div style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--bg-2)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>endpoint</div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--ink-2)', wordBreak: 'break-all', lineHeight: 1.4, marginBottom: 8 }}>
            <span style={{ color: 'var(--ink-3)' }}>/mcp/</span>
            <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{group.name}</b>
          </div>
          <Endpoint url={endpointUrl} />
        </div>
      </div>

      {/* Footer stats */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line-2)', background: 'var(--bg-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--ink-3)' }}>
        <div className="mono">
          <span style={{ color: 'var(--ink-2)' }}>{serverNames.length}</span> 服务 ·{' '}
          <span style={{ color: 'var(--ink-2)' }}>
            {serverStatuses.reduce((a, s) => a + s.tools, 0)}
          </span> 工具
        </div>
        <button className="ds-btn sm ghost" onClick={() => onEdit(group)} style={{ color: 'var(--ink-3)' }}>
          设置可见性
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────
const GroupsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    groups,
    loading: groupsLoading,
    error: groupError,
    setError: setGroupError,
    deleteGroup,
    triggerRefresh,
  } = useGroupData();
  const { allServers } = useServerData({ refreshOnMount: true });

  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showTemplateExport, setShowTemplateExport] = useState(false);
  const [showTemplateImport, setShowTemplateImport] = useState(false);

  const handleDeleteGroup = async (groupId: string) => {
    const result = await deleteGroup(groupId);
    if (!result || !result.success) {
      setGroupError(result?.message || t('groups.deleteError'));
    }
  };

  return (
    <div className="scroll-pad page-fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 className="h-page">{t('pages.groups.title')}</h1>
          <p className="h-page-sub">
            {groups.length} 个分组 · 把多个服务聚合为单一端点 · 支持工具级可见性控制
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowImportForm(true)} className="ds-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {t('groupImport.button')}
          </button>
          <button onClick={() => setShowTemplateExport(true)} className="ds-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {t('template.exportButton')}
          </button>
          <button onClick={() => setShowTemplateImport(true)} className="ds-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {t('template.importButton')}
          </button>
          <button onClick={() => setShowAddForm(true)} className="ds-btn primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {t('groups.add')}
          </button>
        </div>
      </div>

      {/* Error */}
      {groupError && (
        <div className="error-box" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--err)' }}>{groupError}</span>
          <button onClick={() => setGroupError(null)} className="icon-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Content */}
      {groupsLoading ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
          {t('app.loading')}
        </div>
      ) : groups.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Empty create card */}
          <div
            className="card"
            onClick={() => setShowAddForm(true)}
            style={{ border: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, cursor: 'pointer', background: 'transparent' }}
          >
            <div style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line)', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>新建分组</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>把相关服务聚合为一个 URL</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {groups.map((group) => (
            <GroupCardItem
              key={group.id}
              group={group}
              servers={allServers}
              onEdit={(g) => setEditingGroup(g)}
              onDelete={handleDeleteGroup}
            />
          ))}

          {/* Create new card */}
          <div
            className="card"
            onClick={() => setShowAddForm(true)}
            style={{ border: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, cursor: 'pointer', background: 'transparent' }}
          >
            <div style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line)', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>新建分组</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>把相关服务聚合为一个 URL</div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddForm && <AddGroupForm onAdd={() => { setShowAddForm(false); triggerRefresh(); }} onCancel={() => setShowAddForm(false)} />}
      {showImportForm && <GroupImportForm onSuccess={() => { setShowImportForm(false); triggerRefresh(); }} onCancel={() => setShowImportForm(false)} />}
      {editingGroup && <EditGroupForm group={editingGroup} onEdit={() => { setEditingGroup(null); triggerRefresh(); }} onCancel={() => setEditingGroup(null)} />}
      {showTemplateExport && <TemplateExportForm groups={groups} onCancel={() => setShowTemplateExport(false)} />}
      {showTemplateImport && <TemplateImportForm onSuccess={() => { setShowTemplateImport(false); triggerRefresh(); }} onCancel={() => setShowTemplateImport(false)} />}
    </div>
  );
};

export default GroupsPage;
