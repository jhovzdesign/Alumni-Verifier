import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Alumni, CardStatus, QRStatus } from '../../types/alumni.js';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  CreditCard,
  QrCode,
  Archive,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  UserCheck,
  GraduationCap
} from 'lucide-react';

interface AdminAlumniListProps {
  onSelectAlumnus: (alumniId: string) => void;
  onEditAlumnus?: (alumniId: string) => void;
  onAddNew: () => void;
}

export const AdminAlumniList: React.FC<AdminAlumniListProps> = ({
  onSelectAlumnus,
  onEditAlumnus,
  onAddNew
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [degreeLevelFilter, setDegreeLevelFilter] = useState('');
  const [gradYearFilter, setGradYearFilter] = useState('');
  const [campusFilter, setCampusFilter] = useState('');
  const [cardStatusFilter, setCardStatusFilter] = useState('');
  const [qrStatusFilter, setQrStatusFilter] = useState('');

  // Confirmation Modal for Archiving
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const res = await api.getAlumniList({
        query: search,
        program: programFilter,
        degree_level: degreeLevelFilter,
        graduation_year: gradYearFilter,
        campus: campusFilter,
        card_status: cardStatusFilter,
        qr_status: qrStatusFilter,
        page,
        limit: 10
      });
      setItems(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load alumni directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [page, programFilter, degreeLevelFilter, gradYearFilter, campusFilter, cardStatusFilter, qrStatusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAlumni();
  };

  const handleArchiveConfirm = async () => {
    if (!archivingId) return;
    setArchiveLoading(true);
    try {
      await api.archiveAlumnus(archivingId);
      setArchivingId(null);
      await fetchAlumni();
    } catch (err: any) {
      alert(err.message || 'Failed to archive alumni record');
    } finally {
      setArchiveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-900">
            Alumni Directory
          </h1>
          <p className="text-xs text-slate-600">
            Authenticated administrator view of all registered alumni, academic programs, and cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">
            Total records: <strong className="text-slate-900 font-mono">{totalCount}</strong>
          </span>
          <button
            onClick={onAddNew}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            + Add Alumni
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Alumni ID, Name, Card Number, Program, or QR Value..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-xs text-slate-900 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setProgramFilter('');
              setDegreeLevelFilter('');
              setGradYearFilter('');
              setCampusFilter('');
              setCardStatusFilter('');
              setQrStatusFilter('');
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Reset
          </button>
        </form>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">
              Degree Level
            </label>
            <select
              value={degreeLevelFilter}
              onChange={(e) => { setDegreeLevelFilter(e.target.value); setPage(1); }}
              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none"
            >
              <option value="">All Degrees</option>
              <option value="BACHELORS">Bachelor&apos;s</option>
              <option value="MASTERS">Master&apos;s</option>
              <option value="DOCTORATE">Doctorate</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">
              Graduation Year
            </label>
            <select
              value={gradYearFilter}
              onChange={(e) => { setGradYearFilter(e.target.value); setPage(1); }}
              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none"
            >
              <option value="">All Years</option>
              {Array.from({ length: 15 }, (_, i) => 2026 - i).map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">
              Campus
            </label>
            <select
              value={campusFilter}
              onChange={(e) => { setCampusFilter(e.target.value); setPage(1); }}
              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none"
            >
              <option value="">All Campuses</option>
              <option value="Urdaneta">Urdaneta Campus</option>
              <option value="Lingayen">Lingayen Campus</option>
              <option value="Dagupan">Dagupan Campus</option>
              <option value="San Carlos">San Carlos Campus</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">
              Card Status
            </label>
            <select
              value={cardStatusFilter}
              onChange={(e) => { setCardStatusFilter(e.target.value); setPage(1); }}
              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none"
            >
              <option value="">All Cards</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="REVOKED">REVOKED</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">
              QR Status
            </label>
            <select
              value={qrStatusFilter}
              onChange={(e) => { setQrStatusFilter(e.target.value); setPage(1); }}
              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none"
            >
              <option value="">All QR</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">
              Program Keyword
            </label>
            <input
              type="text"
              value={programFilter}
              onChange={(e) => { setProgramFilter(e.target.value); setPage(1); }}
              placeholder="e.g. IT, Nursing"
              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Alumni Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-2">
            <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
            <span className="text-xs text-slate-600">Retrieving alumni records...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No alumni records matched the filter criteria.</p>
            <p className="text-xs text-slate-600">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Profile Photo</th>
                  <th className="py-3 px-4">Alumni ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Academic Program</th>
                  <th className="py-3 px-4">Grad Year</th>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Card Number</th>
                  <th className="py-3 px-4">Card Status</th>
                  <th className="py-3 px-4">QR Status</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {items.map((item) => {
                  const cardStatusBadge = {
                    ACTIVE: 'text-emerald-700 font-bold',
                    EXPIRED: 'text-amber-700 font-bold',
                    REVOKED: 'text-red-700 font-bold'
                  }[item.effective_card_status as string] || 'text-slate-600';

                  const qrStatusBadge = {
                    ACTIVE: 'text-emerald-700 font-semibold',
                    DISABLED: 'text-slate-600 line-through'
                  }[item.qr?.status as string] || 'text-slate-600';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Photo */}
                      <td className="py-2.5 px-4">
                        <div className="w-9 h-11 bg-slate-200 rounded border border-slate-300 overflow-hidden shrink-0">
                          {item.photo_url ? (
                            <img
                              src={item.photo_url}
                              alt={item.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">
                              N/A
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Alumni ID */}
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {item.alumni_id}
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {item.full_name}
                      </td>

                      {/* Program */}
                      <td className="py-2.5 px-4 text-slate-700 max-w-xs truncate" title={item.primary_program}>
                        {item.primary_program}
                      </td>

                      {/* Year */}
                      <td className="py-2.5 px-4 font-mono text-slate-700">
                        {item.primary_graduation_year}
                      </td>

                      {/* Campus */}
                      <td className="py-2.5 px-4 text-slate-600 truncate max-w-[120px]">
                        {item.primary_campus}
                      </td>

                      {/* Card Number */}
                      <td className="py-2.5 px-4 font-mono text-slate-800">
                        {item.card?.card_number || 'None'}
                      </td>

                      {/* Card Status */}
                      <td className="py-2.5 px-4">
                        <span className={cardStatusBadge}>
                          {item.effective_card_status}
                        </span>
                      </td>

                      {/* QR Status */}
                      <td className="py-2.5 px-4">
                        <span className={qrStatusBadge}>
                          {item.qr?.status || 'None'}
                        </span>
                      </td>

                      {/* Date Added */}
                      <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                        {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onSelectAlumnus(item.alumni_id)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="View Record Details & History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectAlumnus(item.alumni_id)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Manage Cards & Academic Records"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setArchivingId(item.alumni_id)}
                            className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Archive Record"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Confirmation Modal for Archiving (Section 63) */}
      {archivingId && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              ARCHIVE ALUMNI RECORD
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to archive alumni record <strong className="font-mono text-slate-900">{archivingId}</strong>?
              This will disable active QR codes, revoke current cards, and hide the graduate from public verification.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setArchivingId(null)}
                disabled={archiveLoading}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveConfirm}
                disabled={archiveLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                {archiveLoading ? 'Archiving...' : 'Yes, Archive Alumni'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
