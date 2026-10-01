import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { VerificationLog } from '../../types/alumni.js';
import {
  FileCheck,
  Search,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AdminVerificationLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [query, setQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getVerificationLogs({
        query,
        result: resultFilter,
        date: dateFilter,
        page,
        limit: 15
      });
      setLogs(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Failed to load verification logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, resultFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-900">
            Verification Logs
          </h1>
          <p className="text-xs text-slate-600">
            Immutable audit trail of all public and administrative QR verification attempts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">
            Total events: <strong className="font-mono text-slate-900">{totalCount}</strong>
          </span>
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Verification Reference, Alumni ID, Token, or IP..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={resultFilter}
              onChange={(e) => { setResultFilter(e.target.value); setPage(1); }}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
            >
              <option value="">All Results</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="REVOKED">REVOKED</option>
              <option value="NOT_FOUND">NOT_FOUND</option>
              <option value="DISABLED">DISABLED</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
            />

            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResultFilter('');
                setDateFilter('');
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-slate-800 animate-spin mx-auto" />
            <span className="text-xs text-slate-600">Retrieving verification audit trail...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-600">
            No verification logs matched the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Verification Reference</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Alumni</th>
                  <th className="py-3 px-4">Card Number</th>
                  <th className="py-3 px-4">Queried Token</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Client IP</th>
                  <th className="py-3 px-4">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const resultBadge = {
                    VERIFIED: 'text-emerald-700 font-bold',
                    EXPIRED: 'text-amber-700 font-bold',
                    REVOKED: 'text-red-700 font-bold',
                    NOT_FOUND: 'text-rose-700 font-bold',
                    DISABLED: 'text-slate-600 font-bold',
                    ERROR: 'text-slate-600 font-bold'
                  }[log.result as string] || 'text-slate-600';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {log.verification_reference}
                      </td>
                      <td className="py-3 px-4">
                        <span className={resultBadge}>{log.result}</span>
                      </td>
                      <td className="py-3 px-4">
                        {log.alumni_id ? (
                          <div>
                            <span className="font-semibold text-slate-900 block">{log.alumni_name}</span>
                            <span className="font-mono text-[10px] text-slate-600">{log.alumni_id}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {log.card_number || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 truncate max-w-[140px]" title={log.searched_token}>
                        {log.searched_token}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(log.verified_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {log.ip_address}
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]" title={log.user_agent}>
                        {log.user_agent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
