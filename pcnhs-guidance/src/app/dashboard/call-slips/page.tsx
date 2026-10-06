'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Student, CallSlipData } from '@/lib/types';
import {
  FileText,
  Printer,
  GraduationCap,
  Calendar,
  Clock,
  User,
  MessageSquare,
  RotateCcw,
  Search,
  CheckCircle,
} from 'lucide-react';

export default function CallSlipsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState<CallSlipData>({
    studentName: '',
    gradeLevel: 7,
    section: '',
    requestedDate: '',
    requestedTime: '',
    purpose: '',
    counselorName: 'Sir Mico',
  });
  const printRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchStudents = useCallback(async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .order('last_name', { ascending: true });
    if (data) setStudents(data);
  }, [supabase]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredDropdownStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setForm({
        ...form,
        studentName: `${student.last_name}, ${student.first_name} ${student.middle_name || ''}`.trim(),
        gradeLevel: student.grade_level,
        section: student.section,
      });
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Guidance Chat Invitation - ${form.studentName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', 'Segoe UI', sans-serif;
              padding: 20mm;
              color: #0f172a;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              body { padding: 15mm; }
            }
            .slip-container {
              max-width: 600px;
              margin: 0 auto;
              border: 2px solid #0ea5e9;
              border-radius: 12px;
              overflow: hidden;
            }
            .slip-header {
              background: linear-gradient(135deg, #0f172a, #1e293b);
              color: white;
              padding: 24px 28px;
              text-align: center;
            }
            .slip-header .school-name {
              font-size: 11px;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #94a3b8;
              margin-bottom: 4px;
            }
            .slip-header h1 {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 2px;
              background: linear-gradient(135deg, #38bdf8, #34d399);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .slip-header .subtitle {
              font-size: 11px;
              color: #64748b;
            }
            .slip-body {
              padding: 28px;
            }
            .greeting {
              font-size: 14px;
              color: #475569;
              margin-bottom: 20px;
              line-height: 1.6;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 24px;
            }
            .info-item {
              padding: 12px 16px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
            }
            .info-item .label {
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #94a3b8;
              margin-bottom: 4px;
            }
            .info-item .value {
              font-size: 14px;
              font-weight: 600;
              color: #0f172a;
            }
            .info-item.full-width {
              grid-column: span 2;
            }
            .purpose-box {
              padding: 16px;
              background: linear-gradient(135deg, #f0f9ff, #ecfdf5);
              border: 1px solid #bae6fd;
              border-radius: 8px;
              margin-bottom: 24px;
            }
            .purpose-box .label {
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #0284c7;
              margin-bottom: 6px;
            }
            .purpose-box .value {
              font-size: 13px;
              color: #0f172a;
              line-height: 1.5;
            }
            .reminder {
              font-size: 11px;
              color: #64748b;
              text-align: center;
              padding: 12px 16px;
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-radius: 8px;
              margin-bottom: 24px;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }
            .signature-box {
              text-align: center;
              width: 45%;
            }
            .signature-line {
              border-top: 1px solid #334155;
              margin-bottom: 4px;
              margin-top: 40px;
            }
            .signature-name {
              font-size: 12px;
              font-weight: 600;
              color: #0f172a;
            }
            .signature-title {
              font-size: 10px;
              color: #64748b;
            }
            .tear-line {
              border-top: 2px dashed #cbd5e1;
              margin: 24px 0;
              position: relative;
            }
            .tear-label {
              position: absolute;
              top: -9px;
              left: 50%;
              transform: translateX(-50%);
              background: white;
              padding: 0 8px;
              font-size: 9px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .verification-pass {
              padding: 20px;
              background: #f8fafc;
              border: 1px dashed #cbd5e1;
              border-radius: 8px;
            }
            .verification-pass h3 {
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #475569;
              margin-bottom: 12px;
              text-align: center;
            }
            .verification-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 8px;
              font-size: 11px;
            }
            .verification-grid .v-label {
              color: #94a3b8;
              font-weight: 500;
            }
            .verification-grid .v-value {
              color: #0f172a;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleReset = () => {
    setForm({
      studentName: '',
      gradeLevel: 7,
      section: '',
      requestedDate: '',
      requestedTime: '',
      purpose: '',
      counselorName: 'Sir Mico',
    });
    setShowPreview(false);
  };

  const canPreview = form.studentName && form.requestedDate && form.requestedTime;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Call Slips</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate printable Guidance Chat Invitations for students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-semibold text-slate-900">Slip Details</h2>
          </div>

          {/* Student Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Student
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
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="input-field pl-9"
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
                          handleStudentSelect(s.id);
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
          </div>

          {/* Manual Override */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <User className="w-3.5 h-3.5 inline mr-1" />
                Student Name
              </label>
              <input
                type="text"
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                placeholder="Last Name, First Name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 inline mr-1" />
                Grade Level
              </label>
              <select
                value={form.gradeLevel}
                onChange={(e) => setForm({ ...form, gradeLevel: parseInt(e.target.value) })}
                className="select-field"
              >
                {[7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Section</label>
              <input
                type="text"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Counselor</label>
              <input
                type="text"
                value={form.counselorName}
                onChange={(e) => setForm({ ...form, counselorName: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Requested Date
              </label>
              <input
                type="date"
                value={form.requestedDate}
                onChange={(e) => setForm({ ...form, requestedDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Requested Time
              </label>
              <input
                type="time"
                value={form.requestedTime}
                onChange={(e) => setForm({ ...form, requestedTime: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
              Purpose / Reason
            </label>
            <textarea
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              rows={3}
              placeholder="Brief purpose of the guidance chat invitation..."
              className="input-field resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowPreview(true)}
              disabled={!canPreview}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              Generate Preview
            </button>
            <button onClick={handleReset} className="btn-secondary">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Print Preview</h2>
            {showPreview && (
              <button onClick={handlePrint} className="btn-accent">
                <Printer className="w-4 h-4" />
                Print Slip
              </button>
            )}
          </div>

          {!showPreview || !canPreview ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-sm text-slate-500">Fill in the form and click &quot;Generate Preview&quot;</p>
              <p className="text-xs text-slate-400 mt-1">The printable slip will appear here</p>
            </div>
          ) : (
            <div
              ref={printRef}
              className="border border-slate-200 rounded-lg overflow-hidden"
              style={{ fontSize: '14px' }}
            >
              <div className="slip-container" style={{ border: '2px solid #0ea5e9', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                  color: 'white',
                  padding: '24px 28px',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>
                    Palayan City National High School
                  </p>
                  <h1 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    marginBottom: '2px',
                    background: 'linear-gradient(135deg, #38bdf8, #34d399)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    ✉ Guidance Chat Invitation
                  </h1>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Office of the Guidance Counselor</p>
                </div>

                {/* Body */}
                <div style={{ padding: '28px' }}>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>
                    Dear <strong style={{ color: '#0f172a' }}>{form.studentName}</strong>,<br />
                    You are cordially invited to visit the Guidance Office for a brief and friendly chat.
                    Please present this slip to your teacher.
                  </p>

                  {/* Info Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: '4px' }}>Student</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{form.studentName}</p>
                    </div>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: '4px' }}>Grade & Section</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Grade {form.gradeLevel} - {form.section}</p>
                    </div>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: '4px' }}>Date</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        {new Date(form.requestedDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: '4px' }}>Time</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{form.requestedTime}</p>
                    </div>
                  </div>

                  {/* Purpose */}
                  {form.purpose && (
                    <div style={{ padding: '16px', background: 'linear-gradient(135deg, #f0f9ff, #ecfdf5)', border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '20px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0284c7', marginBottom: '6px' }}>Purpose</p>
                      <p style={{ fontSize: '13px', color: '#0f172a', lineHeight: 1.5 }}>{form.purpose}</p>
                    </div>
                  )}

                  {/* Reminder */}
                  <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', padding: '10px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '20px' }}>
                    ⏰ Please arrive on time. If you cannot make it, kindly inform the Guidance Office in advance.
                  </div>

                  {/* Signature */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ textAlign: 'center', width: '42%' }}>
                      <div style={{ borderTop: '1px solid #334155', marginBottom: '4px', marginTop: '40px' }} />
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{form.counselorName}</p>
                      <p style={{ fontSize: '10px', color: '#64748b' }}>Guidance Counselor</p>
                    </div>
                    <div style={{ textAlign: 'center', width: '42%' }}>
                      <div style={{ borderTop: '1px solid #334155', marginBottom: '4px', marginTop: '40px' }} />
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Received By</p>
                      <p style={{ fontSize: '10px', color: '#64748b' }}>Date & Signature</p>
                    </div>
                  </div>

                  {/* Tear Line & Verification Pass */}
                  <div style={{ borderTop: '2px dashed #cbd5e1', margin: '24px 0', position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      top: '-9px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'white',
                      padding: '0 8px',
                      fontSize: '9px',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      ✂ Cut Here — Office Verification Pass
                    </span>
                  </div>

                  <div style={{ padding: '16px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#475569', marginBottom: '10px', textAlign: 'center' }}>
                      🏫 Office Verification Pass
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '11px' }}>
                      <div><span style={{ color: '#94a3b8' }}>Student:</span></div>
                      <div style={{ gridColumn: 'span 2' }}><strong>{form.studentName}</strong></div>
                      <div><span style={{ color: '#94a3b8' }}>Grade/Section:</span></div>
                      <div style={{ gridColumn: 'span 2' }}><strong>G{form.gradeLevel} - {form.section}</strong></div>
                      <div><span style={{ color: '#94a3b8' }}>Date/Time:</span></div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <strong>
                          {form.requestedDate && new Date(form.requestedDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} @ {form.requestedTime}
                        </strong>
                      </div>
                      <div><span style={{ color: '#94a3b8' }}>Confirmed:</span></div>
                      <div style={{ gridColumn: 'span 2' }}>☐ Yes &nbsp; ☐ Rescheduled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
