import '@cms/styles/globals/index.scss';
import '@cms/styles/components/admin.scss';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cms-container">
      <div className="admin-layout">
        <header className="admin-header">
          <div className="admin-header-content">
            <h1>Myni CMS</h1>
            <nav className="admin-nav">
              <a href="/admin">Dashboard</a>
              <a href="/admin/content-types">Content Types</a>
            </nav>
          </div>
        </header>
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
