import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Alumni, AcademicRecord, AlumniCard, AlumniQRCode, VerificationLog, ActivityLog, CardStatus, QRStatus } from '../../types/alumni.js';
import QRCodeLib from 'qrcode';
import { decodeQRCodeFromImage, extractVerificationToken } from '../../utils/qrDecoder.js';
import {
  ArrowLeft,
  User,
  GraduationCap,
  CreditCard,
  QrCode,
  FileCheck,
  History as HistoryIcon,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  Archive,
  Loader2,
  Clock,
  Calendar,
  Sparkles,
  Upload
} from 'lucide-react';

interface AdminAlumniDetailProps {
  alumniId: string;
  onBack: () => void;
  onRefreshList?: () => void;
}

export const AdminAlumniDetail: React.FC<AdminAlumniDetailProps> = ({
  alumniId,
  onBack,
  onRefreshList
}) => {
  const [data, setData] = useState<{
    alumnus: Alumni;
    academic_records: AcademicRecord[];
    cards: AlumniCard[];
    qr_codes: AlumniQRCode[];
    verification_logs: VerificationLog[];
    activity_logs: ActivityLog[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'history' | 'activity'>('overview');

  // Modals state
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceCardNumber, setReplaceCardNumber] = useState('');
  const [replaceIssueDate, setReplaceIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [replaceExpDate, setReplaceExpDate] = useState('2031-06-30');
  const [replaceQRValue, setReplaceQRValue] = useState('');
  const [replaceQRImage, setReplaceQRImage] = useState('');
  const [disableOldQR, setDisableOldQR] = useState(true);
  const [replacingLoading, setReplacingLoading] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);

  // Status Change Modal
  const [statusModalCard, setStatusModalCard] = useState<AlumniCard | null>(null);
  const [newStatus, setNewStatus] = useState<CardStatus>('ACTIVE');
  const [revocationReason, setRevocationReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.getAlumnusDetail(alumniId);
      setData(res);
    } catch (err) {
      console.error('Failed to load alumnus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [alumniId]);

  const handleStatusChangeSubmit = async () => {
    if (!statusModalCard) return;
    setStatusLoading(true);
    try {
      await api.updateCardStatus(statusModalCard.id, newStatus, revocationReason || undefined);
      setStatusModalCard(null);
      await fetchDetail();
      onRefreshList?.();
    } catch (err: any) {
      alert(err.message || 'Failed to update card status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleQRStatusToggle = async (qr: AlumniQRCode) => {
    const nextStatus: QRStatus = qr.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change QR status to ${nextStatus}?`)) return;
    try {
      await api.updateQRStatus(qr.id, nextStatus);
      await fetchDetail();
      onRefreshList?.();
    } catch (err: any) {
      alert(err.message || 'Failed to update QR status');
    }
  };

  const handleReplaceCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceCardNumber.trim() || !replaceQRValue.trim()) {
      setReplaceError('Card Number and QR Code token are required.');
      return;
    }
    setReplacingLoading(true);
    setReplaceError(null);

    try {
      await api.replaceCard(alumniId, {
        card_number: replaceCardNumber.trim(),
        issue_date: replaceIssueDate,
        expiration_date: replaceExpDate,
        qr_value: replaceQRValue.trim(),
        qr_image_url: replaceQRImage,
        disable_old_qr: disableOldQR
      });
      setShowReplaceModal(false);
      setReplaceCardNumber('');
      setReplaceQRValue('');
      setReplaceQRImage('');
      await fetchDetail();
      onRefreshList?.();
    } catch (err: any) {
      setReplaceError(err.message || 'Failed to issue replacement card.');
    } finally {
      setReplacingLoading(false);
    }
  };

  const handleGenerateReplaceQR = async () => {
    const seed = `${alumniId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const dataUrl = await QRCodeLib.toDataURL(seed, { width: 300, margin: 2 });
    setReplaceQRValue(seed);
    setReplaceQRImage(dataUrl);
  };

  const handleUploadReplaceQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const decoded = await decodeQRCodeFromImage(file);
      const token = extractVerificationToken(decoded.value);
      setReplaceQRValue(token);
      setReplaceQRImage(decoded.imageDataUrl || '');
    } catch (err: any) {
      setReplaceError(err.message || 'QR code could not be read.');
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
        <span className="text-xs text-slate-600">Retrieving full alumni profile and verification logs...</span>
      </div>
    );
  }

  const { alumnus, academic_records, cards, qr_codes, verification_logs, activity_logs } = data;
  const fullName = `${alumnus.first_name} ${alumnus.middle_name ? alumnus.middle_name + ' ' : ''}${alumnus.last_name}${alumnus.suffix ? ' ' + alumnus.suffix : ''}`;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Back to Alumni Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-serif font-bold text-slate-900">
                {fullName}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700">
                {alumnus.alumni_id}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Registered on {new Date(alumnus.created_at).toLocaleDateString()} · Official Registry Profile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action: Open Live Verification for latest active QR */}
          {qr_codes[0] && (
            <a
              href={`/verify/${encodeURIComponent(qr_codes[0].qr_value)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Test Live Verification</span>
            </a>
          )}

          <button
            onClick={() => {
              setReplaceCardNumber(`AC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
              setShowReplaceModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Replacement Card</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Profile & Academic Records
        </button>
        <button
          onClick={() => setActiveTab('cards')}
          className={`py-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'cards'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cards & QR Tokens ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'history'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Verification History ({verification_logs.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`py-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'activity'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Activity Trail ({activity_logs.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Info Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
              Personal Information
            </h2>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-32 h-40 bg-slate-100 border-2 border-amber-600/40 rounded-xl overflow-hidden shadow-xs">
                {alumnus.photo_url ? (
                  <img
                    src={alumnus.photo_url}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                    No Photo
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900">{fullName}</h3>
                <p className="font-mono text-xs font-semibold text-amber-800">{alumnus.alumni_id}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Email (Private):</span>
                <span className="font-mono">{alumnus.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Phone (Private):</span>
                <span>{alumnus.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Registry Date:</span>
                <span>{new Date(alumnus.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Academic Records Box */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
              Academic Degrees & Records ({academic_records.length})
            </h2>

            <div className="space-y-4">
              {academic_records.map((rec) => (
                <div key={rec.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      {rec.degree_level} Degree
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Graduated: {rec.graduation_year}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-slate-900">
                    {rec.degree_program}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {rec.college} · Major: {rec.major} · Campus: {rec.campus}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CARDS & QR CODES */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
              Card History & Issued Tokens
            </h2>

            <div className="space-y-4">
              {cards.map((card, idx) => {
                const qr = qr_codes.find((q) => q.card_id === card.id);
                const isExpired = new Date() > new Date(card.expiration_date + 'T23:59:59Z');
                let effectiveStatus: CardStatus = card.status;
                if (card.status === 'REVOKED') effectiveStatus = 'REVOKED';
                else if (card.status === 'EXPIRED' || isExpired) effectiveStatus = 'EXPIRED';

                return (
                  <div
                    key={card.id}
                    className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {card.card_number}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-bold ${
                            effectiveStatus === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : effectiveStatus === 'EXPIRED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {effectiveStatus}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            Latest Card
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                        <span>Issued: <strong>{card.issue_date}</strong></span>
                        <span>Expires: <strong>{card.expiration_date}</strong></span>
                        {card.revocation_reason && (
                          <span className="text-red-700 font-medium">
                            Reason: {card.revocation_reason}
                          </span>
                        )}
                      </div>

                      {qr && (
                        <div className="pt-2 flex items-center gap-2 text-xs">
                          <span className="text-slate-600">Associated QR:</span>
                          <span className="font-mono font-bold text-slate-800">{qr.qr_value}</span>
                          <span
                            className={`text-[10px] px-1.5 rounded font-semibold ${
                              qr.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600 line-through'
                            }`}
                          >
                            {qr.status}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setStatusModalCard(card);
                          setNewStatus(card.status);
                          setRevocationReason(card.revocation_reason || '');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                      >
                        Change Status
                      </button>

                      {qr && (
                        <button
                          onClick={() => handleQRStatusToggle(qr)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                            qr.status === 'ACTIVE'
                              ? 'text-red-700 bg-red-50 hover:bg-red-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {qr.status === 'ACTIVE' ? 'Disable QR' : 'Enable QR'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFICATION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            Verification Attempts for this Alumnus
          </h2>

          {verification_logs.length === 0 ? (
            <p className="text-xs text-slate-600 py-6 text-center">No verification scans recorded yet for this record.</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {verification_logs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{log.verification_reference}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          log.result === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.result === 'EXPIRED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.result}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      IP: {log.ip_address} · User-Agent: {log.user_agent.slice(0, 50)}...
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-600 font-mono">
                    {new Date(log.verified_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ACTIVITY TRAIL */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            Administrative Audit Trail
          </h2>

          {activity_logs.length === 0 ? (
            <p className="text-xs text-slate-600 py-6 text-center">No administrative changes recorded.</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {activity_logs.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{act.action}</div>
                    <div className="text-[11px] text-slate-600">
                      Admin: <span className="font-mono">{act.admin_id}</span>
                    </div>
                    {act.metadata && (
                      <pre className="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded mt-1 font-mono">
                        {JSON.stringify(act.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-slate-600">
                    {new Date(act.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: STATUS CHANGE MODAL */}
      {statusModalCard && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Change Card Status: {statusModalCard.card_number}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                >
                  <option value="ACTIVE">ACTIVE (Valid & Verified)</option>
                  <option value="EXPIRED">EXPIRED (Validity passed)</option>
                  <option value="REVOKED">REVOKED (Cancelled / Lost)</option>
                </select>
              </div>

              {newStatus === 'REVOKED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Revocation
                  </label>
                  <input
                    type="text"
                    required
                    value={revocationReason}
                    onChange={(e) => setRevocationReason(e.target.value)}
                    placeholder="e.g. Card reported lost by alumni holder"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalCard(null)}
                disabled={statusLoading}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusChangeSubmit}
                disabled={statusLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                {statusLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ISSUE REPLACEMENT CARD MODAL (Section 57, 58) */}
      {showReplaceModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              Issue Replacement Alumni Card
            </h3>
            <p className="text-xs text-slate-600">
              Creates a newly issued physical card and QR token while preserving historical verification records.
            </p>

            {replaceError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                {replaceError}
              </div>
            )}

            <form onSubmit={handleReplaceCardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Card Number
                </label>
                <input
                  type="text"
                  required
                  value={replaceCardNumber}
                  onChange={(e) => setReplaceCardNumber(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    required
                    value={replaceIssueDate}
                    onChange={(e) => setReplaceIssueDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    required
                    value={replaceExpDate}
                    onChange={(e) => setReplaceExpDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* QR Association */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    New QR Code Token
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateReplaceQR}
                    className="text-xs text-amber-800 hover:text-amber-900 font-semibold cursor-pointer"
                  >
                    + Generate Token
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={replaceQRValue}
                    onChange={(e) => setReplaceQRValue(e.target.value)}
                    placeholder="Enter or generate token"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                  <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer shrink-0">
                    <span>Upload QR</span>
                    <input
                      type="file"
                      onChange={handleUploadReplaceQR}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>

                {replaceQRImage && (
                  <div className="w-20 h-20 bg-white border border-slate-300 rounded p-1 mx-auto">
                    <img src={replaceQRImage} alt="QR preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Checkbox to disable old QR */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="disable-old-qr-chk"
                  checked={disableOldQR}
                  onChange={(e) => setDisableOldQR(e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded border-slate-300"
                />
                <label htmlFor="disable-old-qr-chk" className="text-xs text-slate-700 cursor-pointer">
                  Automatically expire previous cards & disable prior QR tokens
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(false)}
                  disabled={replacingLoading}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replacingLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  {replacingLoading ? 'Saving...' : 'Issue Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
