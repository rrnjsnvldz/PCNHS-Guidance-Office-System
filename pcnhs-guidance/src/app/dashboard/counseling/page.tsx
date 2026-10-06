'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CounselingSession, Student, SessionFormData } from '@/lib/types';
import {
  Search,
  Plus,
  X,
  BookLock,
  Save,
  Shield,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Lock,
  BarChart3,
  ArrowUpRight,
  Users,
  CheckCircle,
  PlayCircle,
} from 'lucide-react';

const categoryOptions = [
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'academic_sardo', label: 'Academic / SARDO' },
  { value: 'personal_emotional', label: 'Personal / Emotional' },
  { value: 'career_exit', label: 'Career / Exit' },
  { value: 'parent_conference', label: 'Parent Conference' },
];

export default function CounselingPage() {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
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
  const [cardFilter, setCardFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirmCompleteId, setConfirmCompleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [revealedNotes, setRevealedNotes] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<SessionFormData>({
    student_id: '',
    session_date: getLocalDatetime(),
    category: 'behavioral',
    private_notes: '',
    action_plan: '',
    follow_up_date: '',
    parent_session_id: null,
    previous_private_notes: '',
    previous_action_plan: '',
    previous_session_date: '',
  });
  const supabase = createClient();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('counseling_sessions')
      .select('*, student:students(id, first_name, last_name, grade_level, section), parent:parent_session_id(session_date)')
      .order('session_date', { ascending: false });

    if (error) console.error('Error fetching sessions:', error);
    else setSessions(data || []);
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
    fetchSessions();
    fetchStudents();
  }, [fetchSessions, fetchStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) {
      alert("Please select a student from the dropdown list.");
      return;
    }
    setSaving(true);

    const { error } = await supabase.from('counseling_sessions').insert([
      {
        student_id: form.student_id,
        session_date: form.session_date,
        category: form.category,
        private_notes: form.private_notes,
        action_plan: form.action_plan || null,
        follow_up_date: form.follow_up_date || null,
        status: form.follow_up_date ? 'follow_up_scheduled' : 'completed',
        parent_session_id: form.parent_session_id || null,
      },
    ]);

    if (!error && form.parent_session_id) {
      await supabase.from('counseling_sessions').update({ status: 'completed' }).eq('id', form.parent_session_id);
    }

    if (error) {
      alert('Error saving session: ' + error.message);
    } else {
      setShowModal(false);
      setForm({
        student_id: '',
        session_date: new Date().toISOString().slice(0, 16),
        category: 'behavioral',
        private_notes: '',
        action_plan: '',
        follow_up_date: '',
        parent_session_id: null,
        previous_private_notes: '',
        previous_action_plan: '',
        previous_session_date: '',
      });
      fetchSessions();
    }
    setSaving(false);
  };

  const toggleNotes = (id: string) => {
    setRevealedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const categoryLabel = (c: string) =>
    categoryOptions.find((o) => o.value === c)?.label || c;

  const filteredSessions = sessions.filter((s) => {
    if (cardFilter === 'this_month') {
      const now = new Date();
      const d = new Date(s.session_date);
      if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
    }
    if (cardFilter === 'pending_follow_ups') {
      if (s.status !== 'follow_up_scheduled') return false;
    }

    if (statusFilter && s.status !== statusFilter) return false;

    if (search) {
      const student = s.student as unknown as { first_name: string; last_name: string } | null;
      const name = student ? `${student.first_name} ${student.last_name}`.toLowerCase() : '';
      if (!name.includes(search.toLowerCase())) return false;
    }

    return true;
  });

  const filteredDropdownStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Counseling Vault</h1>
            <Lock className="w-5 h-5 text-violet-500" />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Confidential session records — Guidance Admin access only
          </p>
        </div>
        <button
          onClick={() => {
            setForm({
              student_id: '',
              session_date: getLocalDatetime(),
              category: 'behavioral',
              private_notes: '',
              action_plan: '',
              follow_up_date: '',
              parent_session_id: null,
              previous_private_notes: '',
              previous_action_plan: '',
              previous_session_date: '',
            });
            setShowModal(true);
          }}
          className="btn-accent"
        >
          <Plus className="w-4 h-4" />
          New Session
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
          (() => {
            const now = new Date();
            const thisMonth = sessions.filter((s) => {
              const d = new Date(s.session_date);
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length;
            const pendingFollowUps = sessions.filter((s) => s.status === 'follow_up_scheduled').length;
            const uniqueStudents = new Set(sessions.filter(s => !s.parent_session_id).map((s) => s.student_id)).size;

            return [
              { label: 'Total Sessions', key: '', value: sessions.length, icon: BarChart3, color: '#8b5cf6', bg: '#8b5cf615' },
              { label: 'This Month', key: 'this_month', value: thisMonth, icon: Calendar, color: '#0ea5e9', bg: '#0ea5e915' },
              { label: 'Pending Follow-Ups', key: 'pending_follow_ups', value: pendingFollowUps, icon: Clock, color: '#f59e0b', bg: '#f59e0b15' },
              { label: 'Students Counseled', key: '', value: uniqueStudents, icon: Users, color: '#10b981', bg: '#10b98115' },
            ].map((card) => (
              <div 
                key={card.label} 
                className={`metric-card animate-fade-in cursor-pointer transition-all duration-200 hover:-translate-y-1 ${cardFilter && cardFilter === card.key ? 'ring-2 ring-violet-500' : ''}`} 
                style={{ borderTop: 'none' }}
                onClick={() => setCardFilter(cardFilter === card.key ? '' : card.key)}
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
                {card.label === 'Total Sessions' && sessions.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium" style={{ color: card.color }}>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{uniqueStudents} unique students</span>
                  </div>
                )}
              </div>
            ));
          })()
        )}
      </div>

      {/* Security Banner */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #8b5cf615, #6366f115)',
          border: '1px solid #8b5cf620',
        }}
      >
        <Shield className="w-5 h-5 text-violet-500 shrink-0" />
        <p className="text-sm text-violet-700">
          <span className="font-semibold">Confidential Records.</span> Session notes are protected and only visible to authorized guidance counselors. Click the eye icon to reveal notes.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card px-5 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sessions by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field sm:w-56 shrink-0"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="follow_up_scheduled">Follow-up Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card px-6 py-10 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <div className="w-5 h-5 border-2 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
              Loading sessions...
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="card px-6 py-10 text-center">
            <BookLock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No counseling sessions recorded yet</p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const student = session.student as unknown as {
              first_name: string;
              last_name: string;
              grade_level: number;
              section: string;
            } | null;
            const isRevealed = revealedNotes.has(session.id);

            return (
              <div key={session.id} className="card overflow-hidden">
                {/* Card header stripe */}
                <div
                  className="h-1"
                  style={{
                    background: 'linear-gradient(90deg, #8b5cf6, #6366f1, #0ea5e9)',
                  }}
                />

                <div className="px-6 py-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #8b5cf620, #6366f120)',
                          }}
                        >
                          <BookLock className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {student ? `${student.last_name}, ${student.first_name}` : 'Unknown Student'}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {student ? `Grade ${student.grade_level} - ${student.section}` : ''} •{' '}
                            {categoryLabel(session.category)}
                          </p>
                        </div>
                      </div>

                      {/* Session Details */}
                      <div className="flex flex-col gap-1 mb-4 mt-2">
                        {session.parent && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="w-4 h-4 text-slate-300" />
                            <span>
                              Original Session:{' '}
                              {new Date(session.parent.session_date).toLocaleDateString('en-PH', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-violet-500" />
                            <span className={session.parent ? 'font-medium text-violet-700' : ''}>
                              {session.parent ? 'Follow-up on ' : ''}
                              {new Date(session.session_date).toLocaleDateString('en-PH', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          {session.follow_up_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-violet-400" />
                            <span className="text-violet-600 font-medium">
                              Follow-up:{' '}
                              {new Date(session.follow_up_date).toLocaleDateString('en-PH', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                        </div>
                        {/* Status Badge */}
                        <div className="ml-auto">
                          {session.status === 'completed' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Completed
                            </span>
                          )}
                          {session.status === 'follow_up_scheduled' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              <Clock className="w-3.5 h-3.5" />
                              Follow-up Scheduled
                            </span>
                          )}
                          {session.status === 'open' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              <PlayCircle className="w-3.5 h-3.5" />
                              Open
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Private Notes (Redacted by default) */}
                      <div className="space-y-3">
                        <div
                          className="p-4 rounded-lg"
                          style={{
                            background: isRevealed ? '#f8fafc' : '#f1f5f9',
                            border: `1px solid ${isRevealed ? '#e2e8f0' : '#e2e8f0'}`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Private Notes
                            </p>
                            <button
                              onClick={() => toggleNotes(session.id)}
                              className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
                            >
                              {isRevealed ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  Reveal
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {isRevealed
                              ? session.private_notes
                              : '•'.repeat(Math.min(session.private_notes.length, 50)) + '...'}
                          </p>
                        </div>

                        {session.action_plan && (
                          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                              Action Plan
                            </p>
                            <p className="text-sm text-emerald-800 whitespace-pre-wrap">{session.action_plan}</p>
                          </div>
                        )}

                        {/* Workflow Actions */}
                        {session.status === 'follow_up_scheduled' && (
                          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => {
                                setForm({
                                  student_id: session.student_id,
                                  session_date: getLocalDatetime(),
                                  category: session.category,
                                  private_notes: '',
                                  action_plan: '',
                                  follow_up_date: '',
                                  parent_session_id: session.id,
                                  previous_private_notes: session.private_notes,
                                  previous_action_plan: session.action_plan || '',
                                  previous_session_date: session.session_date,
                                });
                                const studentObj = students.find(s => s.id === session.student_id);
                                setStudentSearchTerm(studentObj ? `${studentObj.last_name}, ${studentObj.first_name} — Grade ${studentObj.grade_level} ${studentObj.section}` : '');
                                setShowModal(true);
                              }}
                              className="btn-accent text-xs py-1.5 px-3"
                            >
                              <PlayCircle className="w-4 h-4" />
                              Start Follow-up Session
                            </button>
                            <button
                              onClick={() => setConfirmCompleteId(session.id)}
                              className="text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                            >
                              Mark as Completed
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Session Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '42rem' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookLock className="w-5 h-5 text-violet-500" />
                <h2 className="text-lg font-semibold text-slate-900">New Counseling Session</h2>
              </div>
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
                            className="px-4 py-2 hover:bg-violet-50 cursor-pointer text-sm text-slate-700"
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
                    {form.parent_session_id ? 'Follow-up Session Date & Time' : 'Session Date & Time'} <span className="text-red-500">*</span>
                  </label>
                  {form.previous_session_date && (
                    <div className="mb-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="font-semibold text-slate-600">Original Session:</span>{' '}
                      {new Date(form.previous_session_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                  <input
                    type="datetime-local"
                    value={form.session_date}
                    onChange={(e) => setForm({ ...form, session_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as SessionFormData['category'] })}
                    className="select-field"
                    required
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Private Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-violet-500" />
                    Confidential Session Notes <span className="text-red-500">*</span>
                  </div>
                </label>
                {form.previous_private_notes && (
                  <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 whitespace-pre-wrap">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Previous Notes</p>
                    {form.previous_private_notes}
                  </div>
                )}
                <textarea
                  value={form.private_notes}
                  onChange={(e) => setForm({ ...form, private_notes: e.target.value })}
                  rows={4}
                  placeholder={form.parent_session_id ? "Enter new follow-up notes here..." : "Record detailed session notes here. These are confidential and only visible to guidance counselors..."}
                  className="input-field resize-none"
                  required
                />
              </div>

              {/* Action Plan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Action Plan</label>
                {form.previous_action_plan && (
                  <div className="mb-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm text-emerald-800 whitespace-pre-wrap">
                    <p className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider mb-1">Previous Action Plan</p>
                    {form.previous_action_plan}
                  </div>
                )}
                <textarea
                  value={form.action_plan}
                  onChange={(e) => setForm({ ...form, action_plan: e.target.value })}
                  rows={3}
                  placeholder={form.parent_session_id ? "Enter new follow-up action plan here..." : "Steps to be taken, recommendations, follow-up actions..."}
                  className="input-field resize-none"
                />
              </div>

              {/* Follow-up Date */}
              <div className="sm:w-1/2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Follow-up Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <p className="text-xs text-slate-500 mb-2">Leave blank if the counseling session is fully resolved.</p>
                <input
                  type="date"
                  value={form.follow_up_date}
                  onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-accent">
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmCompleteId && (
        <div className="modal-overlay" onClick={() => setConfirmCompleteId(null)}>
          <div className="modal-content text-center p-6" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '24rem' }}>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Mark as Completed?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to mark this follow-up sequence as fully resolved? This will close the session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCompleteId(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSaving(true);
                  await supabase.from('counseling_sessions').update({ status: 'completed' }).eq('id', confirmCompleteId);
                  await fetchSessions();
                  setSaving(false);
                  setConfirmCompleteId(null);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Yes, Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
