'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Student, StudentFormData } from '@/lib/types';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Users,
  Save,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Phone,
  Calendar,
  User,
  UserCheck,
  Tags,
  ArrowUpRight,
  AlertTriangle,
  Briefcase,
  Accessibility,
  Heart,
  Clock,
  BookOpen,
} from 'lucide-react';

const emptyForm: StudentFormData = {
  lrn: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  grade_level: 7,
  section: '',
  gender: '',
  birthdate: '',
  guardian_name: '',
  guardian_contact: '',
  is_sardo: false,
  is_4ps: false,
  is_ip_sped: false,
  is_working_student: false,
  has_recurring_behavior: false,
  is_pwd: false,
  is_solo_parent_child: false,
  has_5_absences: false,
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    withTags: 0,
    fourPs: 0,
    sardo: 0,
    pwd: 0,
    ipSped: 0,
    workingStudent: 0,
    soloParent: 0,
    recurringBehavior: 0,
    fiveAbsences: 0,
    grade7: 0,
    grade8: 0,
    grade9: 0,
    grade10: 0,
    grade11: 0,
    grade12: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const pageSize = 15;
  const supabase = createClient();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })
      .order('last_name', { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,lrn.ilike.%${search}%`
      );
    }
    if (gradeFilter) {
      query = query.eq('grade_level', parseInt(gradeFilter));
    }
    if (tagFilter) {
      query = query.eq(tagFilter, true);
    }

    const { data, count, error } = await query;
    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [page, search, gradeFilter, tagFilter, supabase]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const { data } = await supabase.from('students').select('grade_level, gender, is_4ps, is_sardo, is_pwd, is_ip_sped, is_working_student, is_solo_parent_child, has_recurring_behavior, has_5_absences');
    if (data) {
      setStats({
        total: data.length,
        withTags: data.filter((s) => s.is_4ps || s.is_sardo || s.is_pwd || s.is_ip_sped || s.is_working_student || s.is_solo_parent_child || s.has_recurring_behavior || s.has_5_absences).length,
        fourPs: data.filter((s) => s.is_4ps).length,
        sardo: data.filter((s) => s.is_sardo).length,
        pwd: data.filter((s) => s.is_pwd).length,
        ipSped: data.filter((s) => s.is_ip_sped).length,
        workingStudent: data.filter((s) => s.is_working_student).length,
        soloParent: data.filter((s) => s.is_solo_parent_child).length,
        recurringBehavior: data.filter((s) => s.has_recurring_behavior).length,
        fiveAbsences: data.filter((s) => s.has_5_absences).length,
        grade7: data.filter((s) => s.grade_level === 7).length,
        grade8: data.filter((s) => s.grade_level === 8).length,
        grade9: data.filter((s) => s.grade_level === 9).length,
        grade10: data.filter((s) => s.grade_level === 10).length,
        grade11: data.filter((s) => s.grade_level === 11).length,
        grade12: data.filter((s) => s.grade_level === 12).length,
      });
    }
    setStatsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [fetchStudents, fetchStats]);

  const openAddModal = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setForm({
      lrn: student.lrn,
      first_name: student.first_name,
      last_name: student.last_name,
      middle_name: student.middle_name || '',
      grade_level: student.grade_level,
      section: student.section,
      gender: student.gender || '',
      birthdate: student.birthdate || '',
      guardian_name: student.guardian_name || '',
      guardian_contact: student.guardian_contact || '',
      is_sardo: student.is_sardo,
      is_4ps: student.is_4ps,
      is_ip_sped: student.is_ip_sped,
      is_working_student: student.is_working_student,
      has_recurring_behavior: student.has_recurring_behavior,
      is_pwd: student.is_pwd,
      is_solo_parent_child: student.is_solo_parent_child,
      has_5_absences: student.has_5_absences,
    });
    setShowModal(true);
  };

  const openViewModal = (student: Student) => {
    setViewingStudent(student);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      lrn: form.lrn,
      first_name: form.first_name,
      last_name: form.last_name,
      middle_name: form.middle_name || null,
      grade_level: form.grade_level,
      section: form.section,
      gender: form.gender || null,
      birthdate: form.birthdate || null,
      guardian_name: form.guardian_name || null,
      guardian_contact: form.guardian_contact || null,
      is_sardo: form.is_sardo,
      is_4ps: form.is_4ps,
      is_ip_sped: form.is_ip_sped,
      is_working_student: form.is_working_student,
      has_recurring_behavior: form.has_recurring_behavior,
      is_pwd: form.is_pwd,
      is_solo_parent_child: form.is_solo_parent_child,
      has_5_absences: form.has_5_absences,
    };

    if (editingStudent) {
      const { error } = await supabase
        .from('students')
        .update(payload)
        .eq('id', editingStudent.id);
      if (error) {
        alert('Error updating student: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('students').insert([payload]);
      if (error) {
        alert('Error adding student: ' + error.message);
      }
    }

    setSaving(false);
    setShowModal(false);
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student record? This action cannot be undone.')) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      alert('Error deleting student: ' + error.message);
    } else {
      fetchStudents();
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const tagBadge = (label: string, active: boolean) => {
    if (!active) return null;
    return (
      <span
        key={label}
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: '#dbeafe', color: '#1e40af' }}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student profiles and records • {totalCount} total students
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Tag Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {statsLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="metric-card px-3 py-3" style={{ borderTop: 'none' }}>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="skeleton w-8 h-8 rounded-lg mb-2" />
                <div className="skeleton h-6 w-10 mb-1" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
          ))
        ) : (
          [
            { label: '4Ps', key: 'is_4ps', value: stats.fourPs, icon: Tags, color: '#10b981', bg: '#10b98115' },
            { label: 'SARDO', key: 'is_sardo', value: stats.sardo, icon: AlertTriangle, color: '#f59e0b', bg: '#f59e0b15' },
            { label: 'PWD', key: 'is_pwd', value: stats.pwd, icon: Accessibility, color: '#3b82f6', bg: '#3b82f615' },
            { label: 'IP/SPED', key: 'is_ip_sped', value: stats.ipSped, icon: Users, color: '#8b5cf6', bg: '#8b5cf615' },
            { label: 'Working', key: 'is_working_student', value: stats.workingStudent, icon: Briefcase, color: '#0ea5e9', bg: '#0ea5e915' },
            { label: 'Solo Parent', key: 'is_solo_parent_child', value: stats.soloParent, icon: Heart, color: '#ec4899', bg: '#ec489915' },
            { label: 'Behavior', key: 'has_recurring_behavior', value: stats.recurringBehavior, icon: UserCheck, color: '#ef4444', bg: '#ef444415' },
            { label: '5+ Absences', key: 'has_5_absences', value: stats.fiveAbsences, icon: Clock, color: '#f97316', bg: '#f9731615' },
          ].map((card) => (
            <div
              key={card.label}
              className={`metric-card px-3 py-3 cursor-pointer transition-all duration-200 hover:-translate-y-1 ${tagFilter === card.key ? 'ring-2 ring-sky-500' : ''}`}
              style={{ borderTop: 'none' }}
              onClick={() => {
                setTagFilter(tagFilter === card.key ? '' : card.key);
                setPage(0);
              }}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: card.bg }}>
                  <card.icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <p className="text-xl font-bold text-slate-900 mb-0.5">{card.value}</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{card.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Grade Distribution */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card px-4 py-3 flex items-center justify-between" style={{ borderLeft: '3px solid #e2e8f0' }}>
              <div className="skeleton h-4 w-12" />
              <div className="skeleton h-4 w-4" />
            </div>
          ))
        ) : (
          [
            { label: 'Grade 7', grade: '7', value: stats.grade7, color: '#6366f1' },
            { label: 'Grade 8', grade: '8', value: stats.grade8, color: '#8b5cf6' },
            { label: 'Grade 9', grade: '9', value: stats.grade9, color: '#a855f7' },
            { label: 'Grade 10', grade: '10', value: stats.grade10, color: '#d946ef' },
            { label: 'Grade 11', grade: '11', value: stats.grade11, color: '#ec4899' },
            { label: 'Grade 12', grade: '12', value: stats.grade12, color: '#f43f5e' },
          ].map((grade) => (
            <div
              key={grade.label}
              className={`card px-4 py-3 flex items-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 ${gradeFilter === grade.grade ? 'ring-2 ring-sky-500' : ''}`}
              style={{ borderLeft: `3px solid ${grade.color}` }}
              onClick={() => {
                setGradeFilter(gradeFilter === grade.grade ? '' : grade.grade);
                setPage(0);
              }}
            >
              <span className="text-xs font-semibold text-slate-600">{grade.label}</span>
              <span className="text-sm font-bold text-slate-900">{grade.value}</span>
            </div>
          ))
        )}
      </div>

      {/* Filters */}
      <div className="card px-5 py-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or LRN..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={gradeFilter}
              onChange={(e) => { setGradeFilter(e.target.value); setPage(0); }}
              className="select-field flex-1 sm:w-36"
            >
              <option value="">All Grades</option>
              {[7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
            <select
              value={tagFilter}
              onChange={(e) => { setTagFilter(e.target.value); setPage(0); }}
              className="select-field flex-1 sm:w-40"
            >
              <option value="">All Tags</option>
              <option value="is_4ps">4Ps Beneficiary</option>
              <option value="is_sardo">SARDO</option>
              <option value="is_pwd">PWD</option>
              <option value="is_ip_sped">IP / SPED</option>
              <option value="is_working_student">Working Student</option>
              <option value="is_solo_parent_child">Solo Parent</option>
              <option value="has_recurring_behavior">Behavioral</option>
              <option value="has_5_absences">5+ Absences</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>LRN</th>
                <th>Student Name</th>
                <th>Grade & Section</th>
                <th>Gender</th>
                <th>Guardian</th>
                <th>Tags</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
                      Loading students...
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No students found</p>
                    <button onClick={openAddModal} className="text-xs text-sky-600 hover:text-sky-700 mt-1">
                      + Add your first student
                    </button>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {student.lrn}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{
                            background: student.gender === 'Male'
                              ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                              : student.gender === 'Female'
                              ? 'linear-gradient(135deg, #ec4899, #db2777)'
                              : 'linear-gradient(135deg, #64748b, #475569)',
                          }}
                        >
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {student.last_name}, {student.first_name}
                          </p>
                          {student.middle_name && (
                            <p className="text-xs text-slate-400">{student.middle_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm">Grade {student.grade_level} - {student.section}</span>
                    </td>
                    <td className="text-sm">{student.gender || '—'}</td>
                    <td>
                      <p className="text-sm text-slate-700 truncate max-w-[140px]">{student.guardian_name || '—'}</p>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {tagBadge('4Ps', student.is_4ps)}
                        {tagBadge('SARDO', student.is_sardo)}
                        {tagBadge('PWD', student.is_pwd)}
                        {tagBadge('IP/SPED', student.is_ip_sped)}
                        {!student.is_4ps && !student.is_sardo && !student.is_pwd && !student.is_ip_sped && (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(student)}
                          className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                if (pageNum >= totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-sky-500 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '42rem' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* LRN */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Learner Reference Number (LRN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.lrn}
                  onChange={(e) => setForm({ ...form, lrn: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                  placeholder="12-digit LRN"
                  className="input-field font-mono"
                  maxLength={12}
                  required
                />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Middle Name</label>
                  <input
                    type="text"
                    value={form.middle_name}
                    onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Grade, Section, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Grade Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.grade_level}
                    onChange={(e) => setForm({ ...form, grade_level: parseInt(e.target.value) })}
                    className="select-field"
                    required
                  >
                    {[7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    placeholder="e.g. Rizal"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Birthdate + Guardian */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Birthdate</label>
                  <input
                    type="date"
                    value={form.birthdate}
                    onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Guardian Name</label>
                  <input
                    type="text"
                    value={form.guardian_name}
                    onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Guardian Contact</label>
                  <input
                    type="text"
                    value={form.guardian_contact}
                    onChange={(e) => setForm({ ...form, guardian_contact: e.target.value })}
                    placeholder="09XX-XXX-XXXX"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Tags / Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Student Tags</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'is_4ps', label: '4Ps Beneficiary' },
                    { key: 'is_sardo', label: 'SARDO' },
                    { key: 'is_pwd', label: 'PWD' },
                    { key: 'is_ip_sped', label: 'IP/SPED' },
                    { key: 'is_working_student', label: 'Working Student' },
                    { key: 'is_solo_parent_child', label: 'Solo Parent Child' },
                    { key: 'has_recurring_behavior', label: 'Recurring Behavior' },
                    { key: 'has_5_absences', label: '5+ Absences' },
                  ].map((tag) => (
                    <label key={tag.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[tag.key as keyof StudentFormData] as boolean}
                        onChange={(e) =>
                          setForm({ ...form, [tag.key]: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-sm text-slate-600">{tag.label}</span>
                    </label>
                  ))}
                </div>
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
                  {editingStudent ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingStudent && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '36rem' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Student Profile</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Student header */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0"
                  style={{
                    background: viewingStudent.gender === 'Male'
                      ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                      : viewingStudent.gender === 'Female'
                      ? 'linear-gradient(135deg, #ec4899, #db2777)'
                      : 'linear-gradient(135deg, #64748b, #475569)',
                  }}
                >
                  {viewingStudent.first_name[0]}{viewingStudent.last_name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {viewingStudent.last_name}, {viewingStudent.first_name} {viewingStudent.middle_name || ''}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Grade {viewingStudent.grade_level} - {viewingStudent.section}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-1">LRN: {viewingStudent.lrn}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Gender</p>
                    <p className="text-sm font-medium text-slate-900">{viewingStudent.gender || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Birthdate</p>
                    <p className="text-sm font-medium text-slate-900">
                      {viewingStudent.birthdate
                        ? new Date(viewingStudent.birthdate).toLocaleDateString('en-PH', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Guardian</p>
                    <p className="text-sm font-medium text-slate-900">{viewingStudent.guardian_name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Contact</p>
                    <p className="text-sm font-medium text-slate-900">{viewingStudent.guardian_contact || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'is_4ps', label: '4Ps' },
                    { key: 'is_sardo', label: 'SARDO' },
                    { key: 'is_pwd', label: 'PWD' },
                    { key: 'is_ip_sped', label: 'IP/SPED' },
                    { key: 'is_working_student', label: 'Working Student' },
                    { key: 'is_solo_parent_child', label: 'Solo Parent Child' },
                    { key: 'has_recurring_behavior', label: 'Recurring Behavior' },
                    { key: 'has_5_absences', label: '5+ Absences' },
                  ].map((tag) =>
                    viewingStudent[tag.key as keyof Student] ? (
                      <span
                        key={tag.key}
                        className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200"
                      >
                        {tag.label}
                      </span>
                    ) : null
                  )}
                  {![
                    viewingStudent.is_4ps, viewingStudent.is_sardo, viewingStudent.is_pwd,
                    viewingStudent.is_ip_sped, viewingStudent.is_working_student,
                    viewingStudent.is_solo_parent_child, viewingStudent.has_recurring_behavior,
                    viewingStudent.has_5_absences,
                  ].some(Boolean) && (
                    <span className="text-sm text-slate-400">No tags assigned</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(viewingStudent);
                  }}
                  className="btn-secondary"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
