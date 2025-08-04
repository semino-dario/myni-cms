import { getAllContentTypes } from '@config/content-types';

export default function AdminDashboard() {
  const contentTypes = getAllContentTypes();
  const contentTypeNames = Object.keys(contentTypes);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to Myni CMS Administration Panel</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Content Types</h3>
          <span className="stat-number">{contentTypeNames.length}</span>
        </div>
        <div className="stat-card">
          <h3>Total Content</h3>
          <span className="stat-number">0</span>
          <small>Coming soon</small>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Available Content Types</h2>
        <div className="content-types-grid">
          {contentTypeNames.map((name) => {
            const contentType = contentTypes[name];
            return (
              <div key={name} className="content-type-card">
                <h3>{contentType.displayName}</h3>
                <p>{contentType.description || 'No description'}</p>
                <div className="content-type-actions">
                  <a href={`/admin/content/${name}`}>Manage Content</a>
                  <span className="field-count">{contentType.fields.length} fields</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
