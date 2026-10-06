'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { IncidentReferral, Student, IncidentFormData, ReferralStatus } from '@/lib/types';
import {
  Search,
  Plus,
  X,
  AlertTriangle,
  Save,
  Filter,
  ChevronDown,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';

const categoryOptions = [
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'academic_sardo', label: 'Academic / SARDO' },
  { value: 'personal_emotional', label: 'Personal / Emotional' },
  { value: 'career_exit', label: 'Career / Exit' },
  { value: 'parent_conference', label: 'Parent Conference' },
];

const statusOptions: { value: ReferralStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'pending_review', label: 'Pending Review', icon: Clock, color: '#f59e0b' },
  { value: 'under_counseling', label: 'Under Counseling', icon: FileText, color: '#3b82f6' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: '#10b981' },
  { value: 'dismissed', label: 'Dismissed', icon: XCircle, color: '#64748b' },
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentReferral[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  // Helper to get local datetime string for inputs
  const getLocalDatetime = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [search, setSearch] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<IncidentFormData>({
    student_id: '',
    incident_date: getLocalDatetime(),
    incident_category: 'behavioral',
    description: '',
  });
  const supabase = createClient();

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('incident_referrals')
      .select('*, student:students(id, first_name, last_name, grade_level, section)')
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) console.error('Error fetching incidents:', error);
    else setIncidents(data || []);
    setLoading(false);
  }, [supabase]);

  const fetchStudents = useCallback(async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .order('last_name', { ascending: true });
    if (data) setStudents(data);
  }, [supabase]);

  useEffect(() => {
    fetchIncidents();
    fetchStudents();
  }, [fetchIncidents, fetchStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) {
      alert("Please select a student from the dropdown list.");
      return;
    }
    setSaving(true);

    const { error } = await supabase.from('incident_referrals').insert([
      {
        student_id: form.student_id,
        incident_date: form.incident_date,
        incident_category: form.incident_category,
        description: form.description,
        status: 'pending_review',
      },
    ]);

    if (error) {
      alert('Error logging incident: ' + error.message);
    } else {
      setShowModal(false);
      setForm({
        student_id: '',
        incident_date: new Date().toISOString().slice(0, 16),
        incident_category: 'behavioral',
        description: '',
      });
      fetchIncidents();
    }
    setSaving(false);
  };

  const updateStatus = async (incidentId: string, newStatus: ReferralStatus) => {
    const { error } = await supabase
      .from('incident_referrals')
      .update({ status: newStatus })
      .eq('id', incidentId);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      fetchIncidents();
    }
    setShowStatusDropdown(null);
  };

  const categoryLabel = (c: string) => {
    return categoryOptions.find((o) => o.value === c)?.label || c;
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

  const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter && inc.status !== statusFilter) return false;
    if (search) {
      const student = inc.student as unknown as { first_name: string; last_name: string } | null;
      const name = student ? `${student.first_name} ${student.last_name}`.toLowerCase() : '';
      return name.includes(search.toLowerCase()) || inc.description.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const filteredDropdownStudents = students.filter((s) =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incident Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage student behavioral & academic referrals
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Log Incident
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="metric-card" style={{ borderTop: 'none' }}>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-8 w-16" />
                </div>
                <div className="skeleton w-10 h-10 rounded-xl" />
              </div>
            </div>
          ))
        ) : (
          [
            { label: 'Total Incidents', key: '', value: incidents.length, icon: BarChart3, color: '#0ea5e9', bg: '#0ea5e915' },
            { label: 'Pending Review', key: 'pending_review', value: incidents.filter((i) => i.status === 'pending_review').length, icon: Clock, color: '#f59e0b', bg: '#f59e0b15' },
            { label: 'Under Counseling', key: 'under_counseling', value: incidents.filter((i) => i.status === 'under_counseling').length, icon: FileText, color: '#3b82f6', bg: '#3b82f615' },
            { label: 'Resolved', key: 'resolved', value: incidents.filter((i) => i.status === 'resolved').length, icon: CheckCircle, color: '#10b981', bg: '#10b98115' },
          ].map((card) => (
            <div
              key={card.label}
              className={`metric-card animate-fade-in cursor-pointer transition-all duration-200 hover:-translate-y-1 ${statusFilter && statusFilter === card.key ? 'ring-2 ring-sky-500' : ''}`}
              style={{ borderTop: 'none' }}
              onClick={() => setStatusFilter(statusFilter === card.key ? '' : card.key)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
              </div>
              {card.label === 'Total Incidents' && incidents.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs font-medium" style={{ color: card.color }}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{incidents.filter((i) => i.status === 'pending_review' || i.status === 'under_counseling').length} active cases</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Filters */}
      <div className="card px-5 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field sm:w-52"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card px-6 py-10 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <div className="w-5 h-5 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
              Loading incidents...
            </div>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="card px-6 py-10 text-center">
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No incidents found</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const student = incident.student as unknown as {
              first_name: string;
              last_name: string;
              grade_level: number;
              section: string;
            } | null;

            return (
              <div key={incident.id} className="card px-6 py-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: incident.incident_category === 'behavioral' ? '#fef3c720' : '#dbeafe20',
                          border: `1px solid ${incident.incident_category === 'behavioral' ? '#fbbf2440' : '#93c5fd40'}`,
                        }}
                      >
                        <AlertTriangle
                          className="w-5 h-5"
                          style={{
                            color: incident.incident_category === 'behavioral' ? '#f59e0b' : '#3b82f6',
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {student ? `${student.last_name}, ${student.first_name}` : 'Unknown Student'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {student ? `Grade ${student.grade_level} - ${student.section}` : ''} •{' '}
                          {categoryLabel(incident.incident_category)} •{' '}
                          {new Date(incident.incident_date).toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{incident.description}</p>
                        {incident.guidance_notes && (
                          <div className="mt-2 p-2 rounded-lg bg-sky-50 border border-sky-100">
                            <p className="text-xs font-medium text-sky-700">Guidance Notes:</p>
                            <p className="text-xs text-sky-600 mt-0.5">{incident.guidance_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() =>
                        setShowStatusDropdown(showStatusDropdown === incident.id ? null : incident.id)
                      }
                      className={`status-badge ${statusClass(incident.status)} flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
                    >
                      {statusLabel(incident.status)}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showStatusDropdown === incident.id && (
                      <div
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 animate-fade-in"
                      >
                        <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Update Status
                        </p>
                        {statusOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => updateStatus(incident.id, opt.value)}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                              incident.status === opt.value ? 'bg-slate-50 font-medium' : ''
                            }`}
                          >
                            <opt.icon className="w-4 h-4" style={{ color: opt.color }} />
                            {opt.label}
                            {incident.status === opt.value && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Incident Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Log New Incident</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    value={studentSearchTerm}
                    onChange={(e) => {
                      setStudentSearchTerm(e.target.value);
                      setShowDropdown(true);
                      setForm({ ...form, student_id: '' });
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="input-field pl-9"
                    required={!form.student_id}
                  />
                  {showDropdown && studentSearchTerm && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredDropdownStudents.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500 text-center">No students found</div>
                      ) : (
                        filteredDropdownStudents.map((s) => (
                          <div
                            key={s.id}
                            className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-sm text-slate-700"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setForm({ ...form, student_id: s.id });
                              setStudentSearchTerm(`${s.last_name}, ${s.first_name} — Grade ${s.grade_level} ${s.section}`);
                              setShowDropdown(false);
                            }}
                          >
                            <span className="font-medium">{s.last_name}, {s.first_name}</span>
                            <span className="text-slate-500 ml-1">— Grade {s.grade_level} {s.section}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {form.student_id && (
                  <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Student selected
                  </p>
                )}
              </div>

              {/* Date and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Incident Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.incident_date}
                    onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.incident_category}
                    onChange={(e) => setForm({ ...form, incident_category: e.target.value as IncidentFormData['incident_category'] })}
                    className="select-field"
                    required
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Incident Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the incident in detail..."
                  className="input-field resize-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
