import '@cms/styles/globals/index.scss';
import '@cms/styles/components/admin.scss';
import { AuthProvider } from '@cms/contexts/AuthContext';
import AdminLayoutClient from '@cms/components/layout/AdminLayoutClient';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </AuthProvider>
  );
}
