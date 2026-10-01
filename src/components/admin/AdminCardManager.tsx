import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { CardStatus } from '../../types/alumni.js';
import { CreditCard, Search, AlertTriangle, ShieldAlert, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

interface AdminCardManagerProps {
  onSelectAlumnus: (alumniId: string) => void;
}

export const AdminCardManager: React.FC<AdminCardManagerProps> = ({ onSelectAlumnus }) => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'>('ALL');
  const [search, setSearch] = useState('');

  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await api.getAllCards();
      setCards(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const filteredCards = cards.filter((card) => {
    const matchesStatus = statusFilter === 'ALL' || card.effective_status === statusFilter;
    const matchesSearch =
      card.card_number.toLowerCase().includes(search.toLowerCase()) ||
      card.alumni_name.toLowerCase().includes(search.toLowerCase()) ||
      card.alumni_id.toLowerCase().includes(search.toLowerCase());
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
            Monitor active, expired, and revoked university alumni membership cards.
          </p>
        </div>

        <button
          onClick={fetchCards}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
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
              placeholder="Search card # or alumni..."
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
                  <th className="py-3 px-4">Effective Status</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Expiration Date</th>
                  <th className="py-3 px-4">Associated QR</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCards.map((card) => {
                  const badge = {
                    ACTIVE: 'text-emerald-700 font-bold',
                    EXPIRED: 'text-amber-700 font-bold',
                    REVOKED: 'text-red-700 font-bold'
                  }[card.effective_status as string] || 'text-slate-600';

                  return (
                    <tr key={card.id} className="hover:bg-slate-50">
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
                        <span className={badge}>{card.effective_status}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {card.issue_date}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {card.expiration_date}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700">
                        {card.qr_value}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectAlumnus(card.alumni_id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                        >
                          Manage Record
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
    </div>
  );
};
