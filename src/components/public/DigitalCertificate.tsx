import React, { useState } from 'react';
import { PublicVerificationResponse } from '../../types/alumni.js';
import { downloadCertificatePDF } from '../../utils/pdfGenerator.js';
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  Clock,
  Hash,
  ShieldCheck,
  Award,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface DigitalCertificateProps {
  data: PublicVerificationResponse;
  onReset?: () => void;
}

export const DigitalCertificate: React.FC<DigitalCertificateProps> = ({ data, onReset }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { alumni, verification_reference, verified_at } = data;
  if (!alumni) return null;

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      await downloadCertificatePDF('digital-certificate-view', `Alumni-Certificate-${alumni.alumni_id}`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Alumni Verification - ${alumni.full_name}`,
          text: `Official Alumni Certificate verification for ${alumni.full_name} (${alumni.alumni_id})`,
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

  // Degrees: only non-empty
  const bachelors = alumni.academic_records.filter(r => r.degree_level === 'BACHELORS');
  const masters = alumni.academic_records.filter(r => r.degree_level === 'MASTERS');
  const doctorates = alumni.academic_records.filter(r => r.degree_level === 'DOCTORATE');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (Screen Only) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Verified Authentic University Credential</span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Share verification link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Link Copied' : 'Share Verification'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Print certificate"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Download official PDF certificate"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Preparing PDF...' : 'Download as PDF'}</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Container (A4 Printable Layout) */}
      <div
        id="digital-certificate-view"
        className="certificate-print-root bg-white text-slate-900 border-12 border-double border-slate-800 rounded-2xl shadow-xl p-8 sm:p-12 relative overflow-hidden print:border-8 print:p-8 print:shadow-none print:m-0"
        style={{ minHeight: '840px' }}
      >
        {/* Certificate Inner Border Accent */}
        <div className="border border-emerald-700/40 p-6 sm:p-8 rounded-lg relative h-full flex flex-col justify-between">
          {/* Header Section */}
          <div className="text-center space-y-1.5 pb-6 border-b border-slate-200">
            <h1 className="font-serif tracking-widest text-2xl sm:text-3xl font-extrabold uppercase text-slate-900">
              Panpacific University
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-emerald-800">
              Office of Alumni Relations & Registrar
            </p>
            <p className="text-[11px] text-slate-600 tracking-wider uppercase font-medium">
              Official Alumni Verification System
            </p>
          </div>

          {/* Certificate Main Title */}
          <div className="text-center my-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-md text-amber-900 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Official Document of Verification</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wide pt-2">
              CERTIFICATE OF ALUMNI MEMBERSHIP
            </h2>

            <p className="text-sm font-serif italic text-slate-600">
              This is to certify that
            </p>
          </div>

          {/* Alumni Name & Profile Picture Section */}
          <div className="my-4 p-6 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-center gap-6">
            {/* Professional Framed Photo */}
            <div className="shrink-0 relative">
              <div className="w-28 h-36 sm:w-32 sm:h-40 bg-slate-200 border-2 border-amber-600/60 rounded-md overflow-hidden shadow-xs relative">
                {alumni.photo_url ? (
                  <img
                    src={alumni.photo_url}
                    alt={alumni.full_name}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 text-xs">
                    <span>No Photo</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1 shadow-xs border-2 border-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Alumnus Identity */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="space-y-0.5">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                  {alumni.full_name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-serif italic">
                  is a duly registered alumnus/alumna of{' '}
                  <span className="font-semibold text-slate-900 not-italic">
                    Panpacific University
                  </span>
                </p>
              </div>

              {/* Core Alumni Identifiers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Alumni ID</span>
                  <span className="font-mono font-bold text-slate-900">{alumni.alumni_id}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Alumni Card No.</span>
                  <span className="font-mono font-bold text-slate-900">{alumni.card.card_number}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Primary Campus</span>
                  <span className="font-semibold text-slate-900 truncate block">{alumni.primary_campus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Background Section */}
          <div className="my-4 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-slate-700 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Academic Background</span>
              <span className="text-[10px] text-slate-600 normal-case font-normal">Official University Records</span>
            </h4>

            <div className="space-y-3">
              {/* Bachelor's Degree */}
              {bachelors.map((rec, idx) => (
                <div key={idx} className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-200/60">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      Bachelor&apos;s Degree
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Graduated: {rec.graduation_year}
                    </span>
                  </div>
                  <p className="font-serif text-base font-bold text-slate-900 mt-0.5">
                    {rec.degree_program}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {rec.college} {rec.major && rec.major !== rec.degree_program ? `· Major in ${rec.major}` : ''} · {rec.campus}
                  </p>
                </div>
              ))}

              {/* Master's Degree (Only if exists) */}
              {masters.map((rec, idx) => (
                <div key={idx} className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-200/60">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      Master&apos;s Degree
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Graduated: {rec.graduation_year}
                    </span>
                  </div>
                  <p className="font-serif text-base font-bold text-slate-900 mt-0.5">
                    {rec.degree_program}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {rec.college} {rec.major && rec.major !== rec.degree_program ? `· Specialization in ${rec.major}` : ''} · {rec.campus}
                  </p>
                </div>
              ))}

              {/* Doctorate Degree (Only if exists) */}
              {doctorates.map((rec, idx) => (
                <div key={idx} className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-200/60">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      Doctorate Degree
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Graduated: {rec.graduation_year}
                    </span>
                  </div>
                  <p className="font-serif text-base font-bold text-slate-900 mt-0.5">
                    {rec.degree_program}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {rec.college} {rec.major ? `· Specialization: ${rec.major}` : ''} · {rec.campus}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Statement & Official Seal Badge */}
          <div className="my-4 p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>✓ VERIFIED ALUMNI · CARD STATUS: ACTIVE</span>
            </div>
            <p className="text-xs text-emerald-900/90 leading-relaxed font-serif">
              This certificate confirms that the individual identified above is a registered alumnus/alumna of{' '}
              <strong>Panpacific University</strong>, based on the University&apos;s official Alumni Database.
            </p>
          </div>

          {/* Verification Event Metadata & Signatures */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Metadata */}
            <div className="space-y-1.5 text-slate-600">
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Verification Reference:</span>
                <span className="font-mono font-bold text-slate-900">{verification_reference}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Date Verified:</span>
                <span className="font-semibold text-slate-800">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Time Verified:</span>
                <span className="font-semibold text-slate-800">{formattedTime}</span>
              </div>
            </div>

            {/* University Office Signoff */}
            <div className="sm:text-right space-y-1">
              <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Office of the University Registrar
              </p>
              <p className="text-[10px] text-slate-600">
                Panpacific University · Central Administration
              </p>
              <p className="text-[9px] text-slate-600 italic">
                Verified through the Official Alumni Verification System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Link for Public Navigation */}
      {onReset && (
        <div className="no-print text-center pt-2">
          <button
            onClick={onReset}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
          >
            ← Verify Another Alumni Card
          </button>
        </div>
      )}
    </div>
  );
};
