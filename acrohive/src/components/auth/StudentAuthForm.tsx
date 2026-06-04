import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/hooks/useAuth';

type AuthTab = 'signin' | 'signup';

export const StudentAuthForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up form state
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signIn(signInEmail, signInPassword);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    navigate('/events');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signUpPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(
      signUpEmail,
      signUpPassword,
      fullName,
      rollNumber
    );
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    navigate('/events');
  };

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-sm text-muted">
            Student Portal — Register for events, collect tickets
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-primary/20 rounded-xl p-6 md:p-8">
          {/* Tab switcher */}
          <div className="flex mb-6 border-b border-white/10">
            <button
              onClick={() => { setActiveTab('signin'); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                activeTab === 'signin'
                  ? 'text-primary border-primary'
                  : 'text-muted border-transparent hover:text-white'
              }`}
              id="tab-signin"
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                activeTab === 'signup'
                  ? 'text-primary border-primary'
                  : 'text-muted border-transparent hover:text-white'
              }`}
              id="tab-signup"
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-danger/10 border border-danger/20 rounded-lg p-3 mb-4 animate-fade-in-slide">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* SIGN IN form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="student@college.edu"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  className="auth-input"
                  id="signin-email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-muted font-mono uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    className="auth-input pr-10"
                    id="signin-password"
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
                id="signin-submit"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Enter the Arena →'
                )}
              </button>
            </form>
          )}

          {/* SIGN UP form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="auth-input"
                  id="signup-fullname"
                />
              </div>

              <div>
                <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">
                  College Email
                </label>
                <input
                  type="email"
                  placeholder="roll@aitr.ac.in"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  className="auth-input"
                  id="signup-email"
                />
              </div>

              <div>
                <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="0901AI221XXX"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  className="auth-input"
                  id="signup-roll"
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
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    minLength={6}
                    className="auth-input pr-10"
                    id="signup-password"
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

              <div>
                <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="auth-input pr-10"
                    id="signup-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cyber-btn w-full flex items-center justify-center gap-2 mt-2"
                id="signup-submit"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Join the Hive →'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-muted mt-6">
          Admin?{' '}
          <Link
            to="/auth/admin"
            className="text-primary hover:underline font-medium"
          >
            Switch to Admin Login →
          </Link>
        </p>
      </div>
    </div>
  );
};
