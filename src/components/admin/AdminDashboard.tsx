import React, { useState, useEffect } from 'react';
import { AdminStats, VerificationLog, ActivityLog } from '../../types/alumni.js';
import { api } from '../../services/api.js';
import { AdminTab } from './AdminLayout.js';
import {
  Users,
  CreditCard,
  AlertTriangle,
  ShieldAlert,
  QrCode,
  FileCheck,
  Calendar,
  XCircle,
  ArrowRight,
  UserPlus,
  Loader2,
  RefreshCw,
  Clock,
  ShieldCheck,
  History as HistoryIcon
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<VerificationLog[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, logsData, activitiesData] = await Promise.all([
        api.getStats(),
        api.getVerificationLogs({ page: 1, limit: 6 }),
        api.getActivityLogs({ page: 1, limit: 6 })
      ]);
      setStats(statsData);
      setRecentLogs(logsData.items || []);
      setRecentActivities(activitiesData.items || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
        <span className="text-xs font-semibold text-slate-600">Loading university registry statistics...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Alumni',
      value: stats?.total_alumni ?? 0,
      desc: 'Registered graduates',
      icon: Users,
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      title: 'Active Cards',
      value: stats?.active_cards ?? 0,
      desc: 'Currently verified cards',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      title: 'Expired Cards',
      value: stats?.expired_cards ?? 0,
      desc: 'Past expiration date',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      title: 'Revoked Cards',
      value: stats?.revoked_cards ?? 0,
      desc: 'Manually invalidated',
      icon: ShieldAlert,
      color: 'bg-red-50 text-red-800 border-red-200'
    },
    {
      title: 'Registered QR Codes',
      value: stats?.registered_qr_codes ?? 0,
      desc: 'Issued card tokens',
      icon: QrCode,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    {
      title: 'Total Verifications',
      value: stats?.total_verifications ?? 0,
      desc: 'Lifetime query events',
      icon: FileCheck,
      color: 'bg-slate-50 text-slate-800 border-slate-200'
    },
    {
      title: "Today's Verifications",
      value: stats?.today_verifications ?? 0,
      desc: 'Scans recorded today',
      icon: Calendar,
      color: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      title: 'Not Found Attempts',
      value: stats?.not_found_attempts ?? 0,
      desc: 'Unregistered QR scans',
      icon: XCircle,
      color: 'bg-rose-50 text-rose-800 border-rose-200'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            University Registry Overview
          </h1>
          <p className="text-xs text-slate-600">
            Real-time status of alumni cards, QR cryptographic tokens, and live verification logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => onNavigate('alumni-add')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New Alumni</span>
          </button>
        </div>
      </div>

      {/* 8 Statistics Cards (Section 11) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 truncate">
                  {item.title}
                </span>
                <div className={`p-2 rounded-lg border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-600">
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent Verifications & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Verifications */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Recent Public Verifications</h2>
            </div>
            <button
              onClick={() => onNavigate('verification-logs')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900 cursor-pointer"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 divide-y divide-slate-100 flex-1">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-600 py-4 text-center">No recent verifications logged.</p>
            ) : (
              recentLogs.map((log) => {
                const badgeConfig = {
                  VERIFIED: 'text-emerald-700 font-bold',
                  EXPIRED: 'text-amber-700 font-bold',
                  REVOKED: 'text-red-700 font-bold',
                  NOT_FOUND: 'text-rose-700 font-bold',
                  DISABLED: 'text-slate-600 font-bold',
                  ERROR: 'text-slate-600 font-bold'
                }[log.result] || 'text-slate-600';

                return (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-mono font-semibold text-slate-900 truncate">
                        {log.verification_reference}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate">
                        Token: <span className="font-mono">{log.searched_token}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <div className={badgeConfig}>{log.result}</div>
                      <div className="text-[10px] text-slate-600">
                        {new Date(log.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Admin Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Administrator Activity Trail</h2>
            </div>
            <button
              onClick={() => onNavigate('activity-logs')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900 cursor-pointer"
            >
              <span>View All Activities</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 divide-y divide-slate-100 flex-1">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-600 py-4 text-center">No recent administrative activities.</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-start justify-between text-xs gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{act.action}</div>
                    <div className="text-[11px] text-slate-600">
                      Target: <span className="font-mono font-semibold">{act.target_id}</span> ({act.target_type})
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600 shrink-0 text-right">
                    {new Date(act.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
