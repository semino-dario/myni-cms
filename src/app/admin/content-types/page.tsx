import { getAllContentTypes } from "@config/content-types";

export default function ContentTypesPage() {
  const contentTypes = getAllContentTypes();
  const contentTypeNames = Object.keys(contentTypes);

  return (
    <div className="content-types-page">
      <div className="page-header">
        <h1>Content Types</h1>
        <a href="/admin/content-types/new" className="btn-primary">
          + New Content Type
        </a>
      </div>

      <div className="content-types-list">
        {contentTypeNames.map((name) => {
          const contentType = contentTypes[name];
          return (
            <div key={name} className="content-type-item">
              <div className="content-type-info">
                <h3>{contentType.displayName}</h3>
                <p>{contentType.description || "No description"}</p>
                <div className="content-type-meta">
                  <span>Name: {name}</span>
                  <span>Fields: {contentType.fields.length}</span>
                </div>
              </div>

              <div className="content-type-fields">
                <h4>Fields:</h4>
                <ul>
                  {contentType.fields.map((field) => (
                    <li key={field.name}>
                      <strong>{field.displayName}</strong>
                      <span className="field-type">({field.type})</span>
                      {field.required && <span className="required">*</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="content-type-actions">
                <button className="btn-secondary">Edit</button>
                <button className="btn-danger">Delete</button>
                <a href={`/admin/content/${name}`} className="btn-primary">
                  Manage Content
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
