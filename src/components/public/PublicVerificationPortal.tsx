import React, { useState, useEffect, useRef } from 'react';
import { VerificationResultView } from './VerificationResultView.js';
import { PublicVerificationResponse } from '../../types/alumni.js';
import { api } from '../../services/api.js';
import { decodeQRCodeFromImage, extractVerificationToken } from '../../utils/qrDecoder.js';
import {
  QrCode,
  Upload,
  Search,
  Camera,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  FileCheck
} from 'lucide-react';

interface PublicVerificationPortalProps {
  initialToken?: string;
}

export const PublicVerificationPortal: React.FC<PublicVerificationPortalProps> = ({
  initialToken = ''
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<PublicVerificationResponse | null>(null);
  const [isDecodingQR, setIsDecodingQR] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-verify if initialToken is provided in URL
  useEffect(() => {
    if (initialToken) {
      setTokenInput(initialToken);
      performVerification(initialToken);
    }
  }, [initialToken]);

  const performVerification = async (rawCode: string) => {
    const token = extractVerificationToken(rawCode);
    if (!token) {
      setErrorMessage('Please provide a valid alumni card QR code or verification identifier.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.verifyToken(token);
      setVerificationResult(response);
      // Update browser URL without reloading if not already there
      const targetUrl = `/verify/${encodeURIComponent(token)}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
      }
    } catch (err: any) {
      // If error returned is 500 or network failure, render graceful system error state
      setVerificationResult({
        result: 'ERROR',
        verification_reference: 'VER-SYS-ERR',
        verified_at: new Date().toISOString(),
        message: err.message || 'We are unable to verify this QR code at the moment. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    performVerification(tokenInput.trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecodingQR(true);
    setErrorMessage(null);

    try {
      const decoded = await decodeQRCodeFromImage(file);
      setTokenInput(decoded.value);
      await performVerification(decoded.value);
    } catch (err: any) {
      setErrorMessage(err.message || 'QR CODE COULD NOT BE READ. Please upload a clear QR code image.');
    } finally {
      setIsDecodingQR(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setTokenInput('');
    setErrorMessage(null);
    if (window.location.pathname.startsWith('/verify')) {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      {/* Official Header */}
      <header className="bg-white border-b border-slate-200 py-6 px-4 shadow-xs relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-1">
          <h1 className="font-serif tracking-widest text-xl sm:text-2xl font-bold uppercase text-slate-900">
            Panpacific University
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-emerald-800">
            OFFICIAL ALUMNI VERIFICATION
          </p>
          <p className="text-[11px] text-slate-600">
            Official University Registrar & Alumni Registry Services
          </p>
        </div>

        {/* Top-Right Admin Link */}
        <div className="sm:absolute sm:top-5 sm:right-6 mt-3 sm:mt-0 flex justify-center">
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registrar Admin Login</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex items-center justify-center">
        {loading ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 max-w-md w-full">
            <Loader2 className="w-10 h-10 text-slate-800 animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Querying Official Registry...</h2>
              <p className="text-xs text-slate-600">
                Performing live database verification of alumni card credentials.
              </p>
            </div>
          </div>
        ) : verificationResult ? (
          <VerificationResultView data={verificationResult} onReset={handleReset} />
        ) : (
          <div className="w-full max-w-xl space-y-6">
            {/* Verification Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
                  <QrCode className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Verify Alumni Card
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  Scan or upload the QR code found on an official Panpacific University Alumni Card to authenticate membership status in the central university registry.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">Verification Notice</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Upload QR Image Box */}
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  id="qr-file-input"
                />

                <label
                  htmlFor="qr-file-input"
                  className="group flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-800 bg-slate-50/70 hover:bg-slate-50 rounded-xl p-6 transition-all cursor-pointer"
                >
                  {isDecodingQR ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
                      <span className="text-xs font-semibold text-slate-700">
                        Scanning & Decoding QR Image...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="p-3 bg-white rounded-full shadow-xs border border-slate-200 group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6 text-slate-700" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-slate-900 block">
                          Upload Alumni Card QR Image
                        </span>
                        <span className="text-xs text-slate-600">
                          PNG, JPG, or WebP photo of the card QR code
                        </span>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-xs text-slate-600 font-medium uppercase tracking-wider">
                  or enter token manually
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Manual Input Form */}
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label htmlFor="token-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Code or URL
                  </label>
                  <div className="relative">
                    <input
                      id="token-input"
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="e.g. PU-ALUMNI-2024-8X29P7"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none transition-colors"
                    />
                    <Search className="w-4 h-4 text-slate-600 absolute right-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!tokenInput.trim() || isDecodingQR}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Verify Authenticity
                </button>
              </form>
            </div>

            {/* University Registry Notice */}
            <div className="p-4 bg-white/60 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Authoritative University Registry</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Every scan performs a real-time cryptographic verification directly with the Panpacific University central alumni database to validate current membership and active card status.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Official Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center space-y-2">
        <p className="text-xs text-slate-700 font-medium">
          Panpacific University · Office of the University Registrar & Alumni Affairs
        </p>
        <p className="text-[11px] text-slate-600">
          Official University Verification Portal · All verifications are cryptographically logged for audit integrity.
        </p>
        <div className="pt-2">
          <a
            href="/admin"
            className="text-[11px] text-slate-600 hover:text-emerald-700 font-semibold underline underline-offset-2 transition-colors"
          >
            Authorized Registrar Staff Sign-In →
          </a>
        </div>
      </footer>
    </div>
  );
};
