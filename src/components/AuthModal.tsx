import React, { useState } from 'react';
import { X, Mail, Lock, User, Github, Shield, Sparkles, Check, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialType: 'login' | 'signup';
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialType,
  onClose,
  onLoginSuccess,
}) => {
  const [authType, setAuthType] = useState<'login' | 'signup' | 'forgot'>(initialType);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [is2FA, setIs2FA] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (authType === 'forgot') {
        setSuccessMessage('Password reset link sent to your email address!');
        return;
      }

      if (!email || !password || (authType === 'signup' && !name)) {
        setError('Please fill in all required fields.');
        return;
      }

      const displayName = name || email.split('@')[0] || 'Alex Vance';
      onLoginSuccess({ name: displayName, email });
      onClose();
    }, 800);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({ name: `${provider} User`, email: `user@${provider.toLowerCase()}.com` });
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-8 glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 mb-3 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {authType === 'login' && 'Welcome Back to PDFAK'}
            {authType === 'signup' && 'Create Your PDFAK Account'}
            {authType === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {authType === 'forgot'
              ? 'Enter your email to receive recovery instructions'
              : 'Next-Generation AI PDF Platform & Enterprise Workspace'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        {authType !== 'forgot' && (
          <div className="flex rounded-xl bg-black/40 p-1 mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => { setAuthType('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authType === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthType('signup'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authType === 'signup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Error / Success Banners */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium text-center flex items-center justify-center space-x-1.5">
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authType === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alex Vance"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@enterprise.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {authType !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-gray-300">Password</label>
                {authType === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthType('forgot')}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          )}

          {authType === 'signup' && (
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="2fa"
                checked={is2FA}
                onChange={(e) => setIs2FA(e.target.checked)}
                className="rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="2fa" className="text-xs text-gray-300 flex items-center space-x-1 cursor-pointer">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Enable Two-Factor Authentication (2FA) Security</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {authType === 'login' && 'Sign In to Workspace'}
                  {authType === 'signup' && 'Create Account'}
                  {authType === 'forgot' && 'Send Recovery Email'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Social Authentication */}
        {authType !== 'forgot' && (
          <div className="mt-6">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-gray-400 text-[11px] uppercase tracking-wider font-semibold">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center py-2.5 px-3 rounded-xl glass-card hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-200 transition-all"
              >
                <span className="font-bold text-red-400 mr-1.5">G</span> Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="flex items-center justify-center py-2.5 px-3 rounded-xl glass-card hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-200 transition-all"
              >
                <span className="font-bold text-white mr-1.5"></span> Apple
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                className="flex items-center justify-center py-2.5 px-3 rounded-xl glass-card hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-200 transition-all"
              >
                <Github className="w-4 h-4 mr-1.5 text-gray-300" /> GitHub
              </button>
            </div>
          </div>
        )}

        {authType === 'forgot' && (
          <div className="text-center mt-4">
            <button
              onClick={() => setAuthType('login')}
              className="text-xs text-blue-400 hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
