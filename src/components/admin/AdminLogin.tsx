import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { Lock, Mail, KeyRound, AlertCircle, Loader2, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@panpacificu.edu.ph');
  const [password, setPassword] = useState('AdminPass2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.adminLogin(email.trim(), password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      {/* Back to Public Portal Link */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs">
        <a
          href="/"
          className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public QR Scanner</span>
        </a>
        <span className="text-slate-500 font-mono text-[11px]">ADMIN CONSOLE</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-700/40 p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="space-y-1">
            <h1 className="font-serif text-xl font-bold uppercase tracking-wider text-slate-900">
              Panpacific University
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-emerald-800">
              Administrative Portal
            </p>
            <p className="text-[11px] text-slate-600">
              Official University Registrar & Alumni Registry Systems
            </p>
          </div>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Authorized Registrar Credentials</span>
            </span>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@panpacificu.edu.ph', 'AdminPass2026!')}
              className="text-[10px] font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
            >
              Autofill
            </button>
          </div>
          <div className="space-y-0.5 text-[11px] text-emerald-950 font-mono bg-white/70 p-2 rounded border border-emerald-100">
            <div><strong className="font-semibold text-slate-700">Email:</strong> admin@panpacificu.edu.ph</div>
            <div><strong className="font-semibold text-slate-700">Password:</strong> AdminPass2026! <span className="text-slate-600 font-sans text-[10px]">(or admin123)</span></div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Authorized Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@panpacificu.edu.ph"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-sm text-slate-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-700">
                Security Password
              </label>
              <span className="text-[10px] text-slate-600">Encrypted Protocol</span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-sm text-slate-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In to Admin Console</span>
              </>
            )}
          </button>
        </form>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authorized Personnel Notice</span>
          </div>
          <p>
            Access is restricted to verified university registrar personnel. All login events and record modifications are cryptographically logged for audit integrity.
          </p>
        </div>
      </div>
    </div>
  );
};
