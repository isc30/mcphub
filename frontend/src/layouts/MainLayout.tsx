import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { EmbeddingSyncProvider } from '@/contexts/EmbeddingSyncContext';

const PageFallback: React.FC = () => (
  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
    Loading…
  </div>
);

const MainLayout: React.FC = () => {
  return (
    <EmbeddingSyncProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="main-area">
          <Topbar />
          <div className="page-content">
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </EmbeddingSyncProvider>
  );
};

export default MainLayout;
