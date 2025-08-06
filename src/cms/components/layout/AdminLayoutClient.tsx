'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@cms/contexts/AuthContext';
import ProtectedRoute from '@cms/components/auth/ProtectedRoute';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Don't show header and protection on login page
  if (pathname === '/admin/login') {
    return (
      <div className="cms-container">
        {children}
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="cms-container">
        <div className="admin-layout">
          <header className="admin-header">
            <div className="admin-header-content">
              <h1>Myni CMS</h1>
              <nav className="admin-nav">
                <a href="/admin">Dashboard</a>
                <a href="/admin/content-types">Content Types</a>
                <div className="admin-user">
                  <span>Welcome, {user?.name || user?.email}</span>
                  <button onClick={logout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </header>
          <main className="admin-main">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
