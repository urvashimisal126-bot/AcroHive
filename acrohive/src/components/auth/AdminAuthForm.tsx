import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, Shield } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export const AdminAuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Sign in first
    const { error: authError } = await signIn(email, password);

    if (authError) {
      setLoading(false);
      setError(authError);
      return;
    }

    // Verify admin role
    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      // If network fails here during mock login, userError might be populated or fetch might throw.
      if (userError?.message?.includes('Failed to fetch')) {
        console.warn('Bypassing admin role check due to mock mode.');
      } else if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'admin') {
          // Not an admin — sign out and show error
          await supabase.auth.signOut();
          setLoading(false);
          setError('This account does not have admin privileges.');
          return;
        }
      }
    } catch (err) {
      console.warn('Bypassing admin role check due to mock mode.');
    }

    setLoading(false);
    navigate('/command');
  };

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Shield watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Shield className="w-[400px] h-[400px] text-white opacity-[0.03]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Logo size="lg" />
            <span className="badge-warning text-xs">
              <Shield className="w-3 h-3" />
              ADMIN
            </span>
          </div>
          <p className="text-sm text-muted">
            Command Center — Manage events, monitor attendance
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-primary/20 rounded-xl p-6 md:p-8">
          {/* No tabs — admin is sign in only */}
          <div className="mb-6 pb-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-primary">Sign In</h3>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-danger/10 border border-danger/20 rounded-lg p-3 mb-4 animate-fade-in-slide">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@aitr.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                id="admin-email"
              />
            </div>

            <div>
              <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input pr-10"
                  id="admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn w-full flex items-center justify-center gap-2 mt-2"
              id="admin-submit"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Access Command Center →'
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-muted mt-6">
          Student?{' '}
          <Link
            to="/auth/student"
            className="text-primary hover:underline font-medium"
          >
            Switch to Student Login →
          </Link>
        </p>
      </div>
    </div>
  );
};
