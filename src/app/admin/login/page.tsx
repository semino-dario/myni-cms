'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@cms/contexts/AuthContext';
import '@cms/styles/globals/index.scss';
import '@cms/styles/components/admin.scss';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setError('');
    setLoading(true);

    try {
      await login({ email: demoEmail, password: demoPassword });
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cms-container">
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <h1>Myni CMS</h1>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                autoComplete="off"
                data-lpignore="true"
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="new-password"
                data-lpignore="true"
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="login-demo">
            <h3>Quick Demo Login</h3>
            <div className="demo-accounts">
              <button 
                type="button"
                onClick={() => handleDemoLogin('admin@mynicms.com', 'MyniCMS2025!Admin')}
                className="demo-login-btn admin-btn"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login as Admin'}
              </button>
              <button 
                type="button"
                onClick={() => handleDemoLogin('editor@mynicms.com', 'MyniCMS2025!Editor')}
                className="demo-login-btn editor-btn"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login as Editor'}
              </button>
            </div>
            <p className="demo-note">
              Click the buttons above to login directly without typing credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
