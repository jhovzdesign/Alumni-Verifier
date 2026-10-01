import React, { useState } from 'react';
import { PublicVerificationResponse } from '../../types/alumni.js';
import { DigitalCertificate } from './DigitalCertificate.js';
import {
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ServerCrash,
  Calendar,
  Clock,
  Hash,
  Share2,
  Check,
  RotateCcw,
  User,
  CreditCard
} from 'lucide-react';

interface VerificationResultViewProps {
  data: PublicVerificationResponse;
  onReset: () => void;
}

export const VerificationResultView: React.FC<VerificationResultViewProps> = ({
  data,
  onReset
}) => {
  const [copied, setCopied] = useState(false);
  const { result, verification_reference, verified_at, message, alumni } = data;

  const dateObj = new Date(verified_at);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Alumni Verification Status`,
          text: `Official Alumni Verification Reference: ${verification_reference}`,
          url
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  // 1. ACTIVE & VERIFIED
  if (result === 'VERIFIED') {
    return (
      <div className="w-full space-y-6">
        <div className="no-print max-w-xl mx-auto text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold tracking-wide">
            <span>✓ VERIFIED ALUMNI</span>
          </div>
          <p className="text-xs text-slate-600">
            Active official credentials verified with the live university registry.
          </p>
        </div>

        <DigitalCertificate data={data} onReset={onReset} />
      </div>
    );
  }

  // 2. EXPIRED
  if (result === 'EXPIRED') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="bg-white border-2 border-amber-500 rounded-2xl shadow-lg p-6 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 pb-6 border-b border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Panpacific University · Official Alumni Verification
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-base sm:text-lg font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>⚠ ALUMNI VERIFIED — CARD EXPIRED</span>
            </div>
          </div>

          {/* Core Notice Message */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-slate-800 text-sm leading-relaxed">
            <p className="font-semibold text-amber-950">
              {message || 'This individual is registered in the official Alumni Database, but the associated alumni card has expired.'}
            </p>
            <p className="text-xs text-slate-600">
              The graduate retains their bona fide alumni membership in Panpacific University; however, this specific physical card has passed its designated expiration validity and must be renewed by the alumni office.
            </p>
          </div>

          {/* Alumni and Card Details */}
          {alumni && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Registered Record Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Alumnus Name</span>
                  <span className="font-bold text-slate-900 text-sm">{alumni.full_name}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Alumni ID</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{alumni.alumni_id}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Alumni Membership</span>
                  <span className="font-bold text-emerald-800 text-sm">VERIFIED (Active Registry)</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-0.5">
                  <span className="text-amber-800 block text-[10px] uppercase font-semibold">Card Status</span>
                  <span className="font-bold text-amber-900 text-sm">EXPIRED</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Card Number</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{alumni.card.card_number}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Expiration Date</span>
                  <span className="font-semibold text-slate-900 text-sm">{alumni.card.expiration_date}</span>
                </div>
              </div>
            </div>
          )}

          {/* Verification Audit Details */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-600" />
              <span>Reference:</span>
              <span className="font-mono font-bold text-slate-800">{verification_reference}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Verified On:</span>
              <span className="font-semibold text-slate-800">{formattedDate} · {formattedTime}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Verify Another QR</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share Verification Status'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. REVOKED
  if (result === 'REVOKED') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="bg-white border-2 border-red-500 rounded-2xl shadow-lg p-6 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 pb-6 border-b border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Panpacific University · Official Alumni Verification
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-300 rounded-lg text-red-900 text-base sm:text-lg font-bold">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <span>⚠ CARD REVOKED</span>
            </div>
          </div>

          {/* Revocation Warning */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-slate-800 text-sm leading-relaxed">
            <p className="font-bold text-red-950">
              {message || 'This alumni card is no longer valid.'}
            </p>
            <p className="text-xs text-slate-600">
              This card was explicitly revoked or superseded in the central registry. No active privileges, physical access, or digital representations are granted by this card.
            </p>
          </div>

          {/* Specified details for revoked state */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Registry Record Reference
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-600 block text-[10px] uppercase font-semibold">Alumni Name</span>
                <span className="font-bold text-slate-900 text-sm">{alumni?.full_name || 'Registered Alumnus'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-600 block text-[10px] uppercase font-semibold">Alumni ID</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{alumni?.alumni_id || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-slate-600 block text-[10px] uppercase font-semibold">Alumni Membership</span>
                <span className="font-bold text-slate-800 text-sm">REGISTERED</span>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-0.5">
                <span className="text-red-700 block text-[10px] uppercase font-semibold">Card Status</span>
                <span className="font-bold text-red-900 text-sm">REVOKED</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5 col-span-1 sm:col-span-2">
                <span className="text-slate-600 block text-[10px] uppercase font-semibold">Card Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{alumni?.card?.card_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-600" />
              <span>Reference:</span>
              <span className="font-mono font-bold text-slate-800">{verification_reference}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Verification Date:</span>
              <span className="font-semibold text-slate-800">{formattedDate} · {formattedTime}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Verify Another QR</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share Verification'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. NOT FOUND
  if (result === 'NOT_FOUND') {
    return (
      <div className="w-full max-w-xl mx-auto space-y-6">
        <div className="bg-white border-2 border-red-600 rounded-2xl shadow-xl p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <XCircle className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-red-600 tracking-tight">
                ❌ NOT AN ALUMNI MEMBER
              </h1>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
                QR CODE NOT REGISTERED
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              This QR code is not registered in the official Alumni Database of Panpacific University.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-600">Verification Result:</span>
              <span className="font-bold text-red-600">NOT FOUND</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-600">Verification Reference:</span>
              <span className="font-mono font-bold text-slate-800">{verification_reference}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Timestamp:</span>
              <span className="text-slate-800">{formattedDate} {formattedTime}</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Verify Another Alumni Card</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. ERROR / DISABLED / SYSTEM UNAVAILABLE
  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-xl p-8 sm:p-10 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
            <ServerCrash className="w-9 h-9" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            VERIFICATION TEMPORARILY UNAVAILABLE
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {message || 'We are unable to verify this QR code at the moment. Please try again later.'}
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-mono">
          Reference: {verification_reference}
        </div>

        <div className="pt-2">
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
