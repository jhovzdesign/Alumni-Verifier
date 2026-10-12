import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { CardStatus } from '../../types/alumni.js';
import { CreditCard, Search, AlertTriangle, ShieldAlert, CheckCircle2, Loader2, RefreshCw, X } from 'lucide-react';

interface AdminCardManagerProps {
  onSelectAlumnus: (alumniId: string) => void;
}

export const AdminCardManager: React.FC<AdminCardManagerProps> = ({ onSelectAlumnus }) => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'>('ALL');
  const [search, setSearch] = useState('');

  // Status Change Modal
  const [statusModalCard, setStatusModalCard] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<CardStatus>('ACTIVE');
  const [revocationReason, setRevocationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await api.getAllCards();
      const list = Array.isArray(res) ? res : (res?.data || res?.cards || []);
      setCards(list);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleOpenStatusModal = (card: any) => {
    setStatusModalCard(card);
    setNewStatus(card.effective_status || card.status || 'ACTIVE');
    setRevocationReason(card.revocation_reason || '');
    setActionError(null);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalCard) return;

    if (newStatus === 'REVOKED' && !revocationReason.trim()) {
      setActionError('A revocation reason is required when revoking a card.');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      await api.updateCardStatus(
        statusModalCard.id,
        newStatus,
        newStatus === 'REVOKED' ? revocationReason.trim() : undefined
      );
      setStatusModalCard(null);
      await fetchCards();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update card status.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCards = (cards || []).filter((card) => {
    if (!card) return false;
    const effStatus = card.effective_status || card.status || 'ACTIVE';
    const matchesStatus = statusFilter === 'ALL' || effStatus === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      (card.card_number || '').toLowerCase().includes(q) ||
      (card.alumni_name || '').toLowerCase().includes(q) ||
      (card.alumni_id || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-900">
            Card Management
          </h1>
          <p className="text-xs text-slate-600">
            Monitor, inspect, and update active, expired, and revoked university alumni membership cards.
          </p>
        </div>

        <button
          onClick={fetchCards}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {(['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search card #, alumni name, or ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-slate-800 animate-spin mx-auto" />
            <span className="text-xs text-slate-600">Loading cards registry...</span>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-600">
            No cards found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Card Number</th>
                  <th className="py-3 px-4">Alumni Name</th>
                  <th className="py-3 px-4">Alumni ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Expiration Date</th>
                  <th className="py-3 px-4">Associated QR</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCards.map((card) => {
                  const effStatus = card.effective_status || card.status || 'ACTIVE';
                  const badge = {
                    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
                    EXPIRED: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
                    REVOKED: 'bg-red-50 text-red-700 border-red-200 font-bold'
                  }[effStatus as string] || 'bg-slate-50 text-slate-700 border-slate-200';

                  return (
                    <tr key={card.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {card.card_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {card.alumni_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {card.alumni_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${badge}`}>
                          {effStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {card.issue_date}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {card.expiration_date}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700">
                        {card.qr_value || 'None'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleOpenStatusModal(card)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer transition-colors"
                        >
                          Change Status
                        </button>
                        <button
                          onClick={() => onSelectAlumnus(card.alumni_id)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer transition-colors"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Status Modal */}
      {statusModalCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-800" />
                <h3 className="font-bold text-sm text-slate-900">
                  Update Card Status
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalCard(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                {actionError}
              </div>
            )}

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Card Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {statusModalCard.card_number}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Holder: {statusModalCard.alumni_name} ({statusModalCard.alumni_id})
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as CardStatus)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Valid card in good standing)</option>
                  <option value="EXPIRED">EXPIRED (Validity period lapsed)</option>
                  <option value="REVOKED">REVOKED (Lost, cancelled, or superseded)</option>
                </select>
              </div>

              {newStatus === 'REVOKED' && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">
                    Revocation Reason *
                  </label>
                  <textarea
                    rows={2}
                    value={revocationReason}
                    onChange={(e) => setRevocationReason(e.target.value)}
                    placeholder="e.g. Card reported lost by alumnus; superseded by security order."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalCard(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
