'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  AlertTriangle,
  BookOpen,
  Clock,
  TrendingUp,
  ArrowUpRight,
  CalendarDays,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import type { DashboardStats, IncidentReferral, CounselingSession } from '@/lib/types';
import Link from 'next/link';

type GradeData = { grade: string; count: number };
type CategoryData = { name: string; value: number; color: string };
type StatusData = { name: string; value: number; color: string };

const CATEGORY_COLORS: Record<string, { label: string; color: string }> = {
  behavioral: { label: 'Behavioral', color: '#f59e0b' },
  academic_sardo: { label: 'Academic', color: '#3b82f6' },
  personal_emotional: { label: 'Personal', color: '#8b5cf6' },
  career_exit: { label: 'Career', color: '#10b981' },
  parent_conference: { label: 'Parent Conf.', color: '#06b6d4' },
};

const STATUS_COLORS: Record<string, { label: string; color: string }> = {
  pending_review: { label: 'Pending', color: '#f59e0b' },
  under_counseling: { label: 'Counseling', color: '#3b82f6' },
  resolved: { label: 'Resolved', color: '#10b981' },
  dismissed: { label: 'Dismissed', color: '#64748b' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeIncidents: 0,
    sessionsCompleted: 0,
    pendingFollowUps: 0,
  });
  const [recentIncidents, setRecentIncidents] = useState<IncidentReferral[]>([]);
  const [recentSessions, setRecentSessions] = useState<CounselingSession[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<GradeData[]>([]);
  const [incidentCategories, setIncidentCategories] = useState<CategoryData[]>([]);
  const [incidentStatuses, setIncidentStatuses] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch counts
      const [studentsRes, incidentsActiveRes, sessionsRes, followUpsRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase
          .from('incident_referrals')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending_review', 'under_counseling']),
        supabase.from('counseling_sessions').select('*', { count: 'exact', head: true }),
        supabase
          .from('counseling_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('follow_up_date', new Date().toISOString().split('T')[0]),
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        activeIncidents: incidentsActiveRes.count || 0,
        sessionsCompleted: sessionsRes.count || 0,
        pendingFollowUps: followUpsRes.count || 0,
      });

      // Grade distribution chart data
      const { data: studentsData } = await supabase.from('students').select('grade_level');
      if (studentsData) {
        const gradeCounts = studentsData.reduce((acc: Record<number, number>, s) => {
          acc[s.grade_level] = (acc[s.grade_level] || 0) + 1;
          return acc;
        }, {});
        setGradeDistribution(
          Object.entries(gradeCounts)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([grade, count]) => ({
              grade: `Grade ${grade}`,
              count: count as number,
            }))
        );
      }

      // Incident categories chart data
      const { data: allIncidents } = await supabase.from('incident_referrals').select('incident_category, status');
      if (allIncidents) {
        // Category breakdown
        const catCounts = allIncidents.reduce((acc: Record<string, number>, i) => {
          acc[i.incident_category] = (acc[i.incident_category] || 0) + 1;
          return acc;
        }, {});
        setIncidentCategories(
          Object.entries(catCounts).map(([key, value]) => ({
            name: CATEGORY_COLORS[key]?.label || key,
            value: value as number,
            color: CATEGORY_COLORS[key]?.color || '#94a3b8',
          }))
        );

        // Status breakdown
        const statusCounts = allIncidents.reduce((acc: Record<string, number>, i) => {
          acc[i.status] = (acc[i.status] || 0) + 1;
          return acc;
        }, {});
        setIncidentStatuses(
          Object.entries(statusCounts).map(([key, value]) => ({
            name: STATUS_COLORS[key]?.label || key,
            value: value as number,
            color: STATUS_COLORS[key]?.color || '#94a3b8',
          }))
        );
      }

      // Recent incidents
      const { data: incidents } = await supabase
        .from('incident_referrals')
        .select('*, student:students(first_name, last_name, grade_level, section)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (incidents) setRecentIncidents(incidents);

      // Recent sessions
      const { data: sessions } = await supabase
        .from('counseling_sessions')
        .select('*, student:students(first_name, last_name, grade_level, section)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (sessions) setRecentSessions(sessions);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (s: string) => {
    return s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const statusClass = (s: string) => {
    switch (s) {
      case 'pending_review': return 'pending';
      case 'under_counseling': return 'counseling';
      case 'resolved': return 'resolved';
      case 'dismissed': return 'dismissed';
      default: return '';
    }
  };

  const categoryLabel = (c: string) => {
    return CATEGORY_COLORS[c]?.label || c;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="px-3 py-2 rounded-lg text-sm shadow-lg"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          <p className="font-medium">{label}</p>
          <p style={{ color: '#0ea5e9' }}>{payload[0].value} students</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Skeleton metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="metric-card">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-28" />
                  <div className="skeleton h-9 w-16" />
                </div>
                <div className="skeleton w-12 h-12 rounded-xl" />
              </div>
              <div className="skeleton h-3 w-20 mt-3" />
            </div>
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-5 w-48 mb-4" />
              <div className="skeleton h-64 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'sky',
      gradient: 'from-sky-500 to-sky-600',
      bgIcon: '#0ea5e9',
      href: '/dashboard/students',
    },
    {
      label: 'Active Incidents',
      value: stats.activeIncidents,
      icon: AlertTriangle,
      color: 'amber',
      gradient: 'from-amber-500 to-amber-600',
      bgIcon: '#f59e0b',
      href: '/dashboard/incidents',
    },
    {
      label: 'Sessions Completed',
      value: stats.sessionsCompleted,
      icon: BookOpen,
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600',
      bgIcon: '#10b981',
      href: '/dashboard/counseling',
    },
    {
      label: 'Pending Follow-Ups',
      value: stats.pendingFollowUps,
      icon: Clock,
      color: 'violet',
      gradient: 'from-violet-500 to-violet-600',
      bgIcon: '#8b5cf6',
      href: '/dashboard/counseling',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Dashboard Overview
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <CalendarDays className="w-4 h-4" />
          {new Date().toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((card, index) => (
          <Link
            key={card.label}
            href={card.href}
            className={`metric-card ${card.color} group cursor-pointer`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{card.label}</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{card.value}</p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{
                  background: `${card.bgIcon}15`,
                }}
              >
                <card.icon className="w-6 h-6" style={{ color: card.bgIcon }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: card.bgIcon }}>
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>View details</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Grade Level — Bar Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Students by Grade Level
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Enrollment distribution
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: '#0ea5e915' }}
            >
              <Users className="w-4 h-4" style={{ color: '#0ea5e9' }} />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="grade"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Category — Pie Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Incidents by Category
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Referral type breakdown
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: '#f59e0b15' }}
            >
              <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <div className="h-64 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incidentCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {incidentCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown, name: unknown) => [`${value}`, `${name}`]}
                    contentStyle={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3.5 pl-4 flex flex-col justify-center">
              {incidentCategories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {cat.name}
                  </span>
                  <span className="ml-auto text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {cat.value}
                  </span>
                </div>
              ))}
              {/* Total */}
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Total
                </span>
                <span className="ml-auto text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {incidentCategories.reduce((sum, cat) => sum + cat.value, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Recent Incidents</h2>
            </div>
            <Link
              href="/dashboard/incidents"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div>
            {recentIncidents.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Activity className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No incidents recorded yet</p>
                <Link
                  href="/dashboard/incidents"
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 mt-2"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Log first incident
                </Link>
              </div>
            ) : (
              recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="px-6 py-3.5 transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {incident.student
                          ? `${(incident.student as unknown as { last_name: string }).last_name}, ${(incident.student as unknown as { first_name: string }).first_name}`
                          : 'Unknown Student'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {categoryLabel(incident.incident_category)} •{' '}
                        {new Date(incident.incident_date).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`status-badge ${statusClass(incident.status)} shrink-0`}>
                      {statusLabel(incident.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Recent Sessions</h2>
            </div>
            <Link
              href="/dashboard/counseling"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div>
            {recentSessions.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No sessions recorded yet</p>
                <Link
                  href="/dashboard/counseling"
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 mt-2"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Log first session
                </Link>
              </div>
            ) : (
              recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="px-6 py-3.5 transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {session.student
                          ? `${(session.student as unknown as { last_name: string }).last_name}, ${(session.student as unknown as { first_name: string }).first_name}`
                          : 'Unknown Student'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {categoryLabel(session.category)} •{' '}
                        {new Date(session.session_date).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {session.follow_up_date && (
                      <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full shrink-0">
                        Follow-up: {new Date(session.follow_up_date).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
