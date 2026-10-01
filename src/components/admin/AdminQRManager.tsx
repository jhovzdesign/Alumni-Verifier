import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import QRCodeLib from 'qrcode';
import { QrCode, Search, ExternalLink, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react';

interface AdminQRManagerProps {
  onSelectAlumnus: (alumniId: string) => void;
}

export const AdminQRManager: React.FC<AdminQRManagerProps> = ({ onSelectAlumnus }) => {
  const [qrs, setQrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewQR, setPreviewQR] = useState<{ value: string; dataUrl: string } | null>(null);

  const fetchQRs = async () => {
    setLoading(true);
    try {
      const data = await api.getAllQRCodes();
      setQrs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRs();
  }, []);

  const handleToggle = async (qr: any) => {
    const next = qr.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await api.updateQRStatus(qr.id, next);
      await fetchQRs();
    } catch (err: any) {
      alert(err.message || 'Failed to update QR status');
    }
  };

  const handleOpenPreview = async (qrValue: string) => {
    try {
      const dataUrl = await QRCodeLib.toDataURL(qrValue, { width: 320, margin: 2 });
      setPreviewQR({ value: qrValue, dataUrl });
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = qrs.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.qr_value.toLowerCase().includes(s) ||
      q.card_number.toLowerCase().includes(s) ||
      q.alumni_name.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-900">
            Registered QR Codes
          </h1>
          <p className="text-xs text-slate-600">
            Cryptographic tokens associated with official alumni cards for live verification.
          </p>
        </div>

        <button
          onClick={fetchQRs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by QR Token, Card #, or Alumni Name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-slate-800 animate-spin mx-auto" />
            <span className="text-xs text-slate-600">Loading QR database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-600">
            No QR records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">QR Token Value</th>
                  <th className="py-3 px-4">Associated Card</th>
                  <th className="py-3 px-4">Card Status</th>
                  <th className="py-3 px-4">Alumni Name</th>
                  <th className="py-3 px-4">QR Status</th>
                  <th className="py-3 px-4">Uploaded / Issued</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((qr) => (
                  <tr key={qr.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {qr.qr_value}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {qr.card_number}
                    </td>
                    <td className="py-3 px-4 font-semibold text-xs text-slate-700">
                      {qr.card_status}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {qr.alumni_name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-bold ${
                          qr.status === 'ACTIVE'
                            ? 'text-emerald-700'
                            : 'text-slate-600 line-through'
                        }`}
                      >
                        {qr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {new Date(qr.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => handleOpenPreview(qr.qr_value)}
                        className="px-2 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 rounded cursor-pointer"
                        title="View printable QR Code"
                      >
                        View QR
                      </button>

                      <a
                        href={`/verify/${encodeURIComponent(qr.qr_value)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 rounded"
                        title="Open live public verification URL"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-600" />
                        <span>Verify</span>
                      </a>

                      <button
                        onClick={() => handleToggle(qr)}
                        className={`px-2 py-1 text-xs font-semibold rounded cursor-pointer ${
                          qr.status === 'ACTIVE'
                            ? 'text-red-700 hover:bg-red-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {qr.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Preview Modal */}
      {previewQR && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Official QR Token Preview
            </h3>

            <div className="p-3 bg-white border border-slate-300 rounded-xl inline-block shadow-xs">
              <img
                src={previewQR.dataUrl}
                alt="QR Code"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-600 uppercase font-semibold block">
                Cryptographic Token
              </span>
              <p className="font-mono font-bold text-xs text-slate-900 bg-slate-100 p-2 rounded break-all">
                {previewQR.value}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPreviewQR(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <a
                href={previewQR.dataUrl}
                download={`QR-${previewQR.value}.png`}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
