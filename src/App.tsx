import React, { useState, useEffect } from 'react';
import { PublicVerificationPortal } from './components/public/PublicVerificationPortal.js';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout.js';
import { AdminLogin } from './components/admin/AdminLogin.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { AdminAlumniList } from './components/admin/AdminAlumniList.js';
import { AdminAddAlumni } from './components/admin/AdminAddAlumni.js';
import { AdminAlumniDetail } from './components/admin/AdminAlumniDetail.js';
import { AdminCardManager } from './components/admin/AdminCardManager.js';
import { AdminQRManager } from './components/admin/AdminQRManager.js';
import { AdminVerificationLogs } from './components/admin/AdminVerificationLogs.js';
import { AdminActivityLogs } from './components/admin/AdminActivityLogs.js';
import { api } from './services/api.js';

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [currentSearch, setCurrentSearch] = useState(window.location.search);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Admin SPA state
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);

  // Handle SPA 404 redirects from static hosts (e.g. GitHub Pages or Vercel static fallback)
  useEffect(() => {
    if (sessionStorage.redirect) {
      const redirectUrl = sessionStorage.redirect;
      delete sessionStorage.redirect;
      try {
        const url = new URL(redirectUrl);
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
        setCurrentPath(url.pathname);
        setCurrentHash(url.hash);
        setCurrentSearch(url.search);
      } catch (e) {
        // ignore fallback parse error
      }
    }
  }, []);

  // Synchronize route changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setCurrentHash(window.location.hash);
      setCurrentSearch(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Check admin session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await api.checkAdminSession();
        if (session.authenticated) {
          setAdminUser(session.user);
        } else {
          setAdminUser(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setCurrentHash(window.location.hash);
    setCurrentSearch(window.location.search);
  };

  const handleAdminLogout = async () => {
    await api.adminLogout();
    setAdminUser(null);
    navigateTo('/');
  };

  // Route 1: Forbidden public directory routes (Section 8, Section 15)
  const isForbiddenDirectoryRoute = [
    '/alumni',
    '/alumni-directory',
    '/directory',
    '/search-alumni',
    '/alumni/search'
  ].includes(currentPath);

  if (isForbiddenDirectoryRoute) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            403
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Access Prohibited
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            There is no public alumni directory. Official alumni status is strictly verified through individual alumni card QR codes.
          </p>
          <button
            onClick={() => navigateTo('/')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            Go to Official Verification Portal
          </button>
        </div>
      </div>
    );
  }

  // Route 2: Admin routes (/admin, /admin/*, #admin, ?admin)
  const isAdminRoute =
    currentPath.startsWith('/admin') ||
    currentHash === '#admin' ||
    currentHash.startsWith('#/admin') ||
    currentSearch.includes('admin') ||
    currentSearch.includes('portal=admin');

  if (isAdminRoute) {
    if (checkingSession) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-white text-xs font-semibold animate-pulse">
            Verifying administrative session...
          </div>
        </div>
      );
    }

    // If not authenticated, show Admin Login (Section 5, 6)
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => {
            setAdminUser(user);
          }}
        />
      );
    }

    // Authenticated Admin Console (Sections 11 - 13, 22 - 26, 52, 53)
    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(tab) => {
          setAdminTab(tab);
          if (tab !== 'alumni-detail') {
            setSelectedAlumniId(null);
          }
        }}
        onLogout={handleAdminLogout}
        user={adminUser}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onNavigate={(tab) => {
              setAdminTab(tab);
              if (tab !== 'alumni-detail') setSelectedAlumniId(null);
            }}
          />
        )}

        {adminTab === 'alumni-list' && (
          <AdminAlumniList
            onSelectAlumnus={(id) => {
              setSelectedAlumniId(id);
              setAdminTab('alumni-detail');
            }}
            onAddNew={() => setAdminTab('alumni-add')}
          />
        )}

        {adminTab === 'alumni-add' && (
          <AdminAddAlumni
            onSuccess={(newAlumniId) => {
              setSelectedAlumniId(newAlumniId);
              setAdminTab('alumni-detail');
            }}
            onCancel={() => setAdminTab('alumni-list')}
          />
        )}

        {adminTab === 'alumni-detail' && selectedAlumniId && (
          <AdminAlumniDetail
            alumniId={selectedAlumniId}
            onBack={() => {
              setSelectedAlumniId(null);
              setAdminTab('alumni-list');
            }}
            onRefreshList={() => {}}
          />
        )}

        {adminTab === 'cards' && (
          <AdminCardManager
            onSelectAlumnus={(id) => {
              setSelectedAlumniId(id);
              setAdminTab('alumni-detail');
            }}
          />
        )}

        {adminTab === 'qr-codes' && (
          <AdminQRManager
            onSelectAlumnus={(id) => {
              setSelectedAlumniId(id);
              setAdminTab('alumni-detail');
            }}
          />
        )}

        {adminTab === 'verification-logs' && <AdminVerificationLogs />}

        {adminTab === 'activity-logs' && <AdminActivityLogs />}
      </AdminLayout>
    );
  }

  // Route 3: Public verification portal (Default `/` and `/verify/:token`)
  // Section 6, 7, 8, 9, 10: Strict minimal public presentation, no admin buttons, no search directory, no test tools.
  let tokenFromUrl = '';
  if (currentPath.startsWith('/verify/')) {
    tokenFromUrl = decodeURIComponent(currentPath.replace('/verify/', ''));
  }

  return <PublicVerificationPortal initialToken={tokenFromUrl} />;
}

export default App;
