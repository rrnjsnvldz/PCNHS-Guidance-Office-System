// ============================================================
// PCNHS Guidance Office System — TypeScript Type Definitions
// ============================================================

export type UserRole = 'guidance_admin' | 'adviser_teacher';
export type ReferralStatus = 'pending_review' | 'under_counseling' | 'resolved' | 'dismissed';
export type SessionCategory = 'behavioral' | 'academic_sardo' | 'personal_emotional' | 'career_exit' | 'parent_conference';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  grade_assigned?: number | null;
  section_assigned?: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  lrn: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  grade_level: number;
  section: string;
  gender?: string | null;
  birthdate?: string | null;
  guardian_name?: string | null;
  guardian_contact?: string | null;
  is_sardo: boolean;
  is_4ps: boolean;
  is_ip_sped: boolean;
  is_working_student: boolean;
  has_recurring_behavior: boolean;
  is_pwd: boolean;
  is_solo_parent_child: boolean;
  has_5_absences: boolean;
  good_moral_awards: string[];
  photo_url?: string | null;
  created_at: string;
}

export interface IncidentReferral {
  id: string;
  student_id: string;
  referred_by?: string | null;
  incident_date: string;
  incident_category: SessionCategory;
  description: string;
  status: ReferralStatus;
  guidance_notes?: string | null;
  created_at: string;
  // Joined fields
  student?: Student;
}

export interface CounselingSession {
  id: string;
  student_id: string;
  counselor_id?: string | null;
  session_date: string;
  category: SessionCategory;
  private_notes: string;
  action_plan?: string | null;
  follow_up_date?: string | null;
  status: 'open' | 'follow_up_scheduled' | 'completed';
  parent_session_id?: string | null;
  created_at: string;
  // Joined fields
  student?: Student;
  parent?: { session_date: string };
}

export interface DashboardStats {
  totalStudents: number;
  activeIncidents: number;
  sessionsCompleted: number;
  pendingFollowUps: number;
}

// Form types
export interface StudentFormData {
  lrn: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  grade_level: number;
  section: string;
  gender: string;
  birthdate: string;
  guardian_name: string;
  guardian_contact: string;
  is_sardo: boolean;
  is_4ps: boolean;
  is_ip_sped: boolean;
  is_working_student: boolean;
  has_recurring_behavior: boolean;
  is_pwd: boolean;
  is_solo_parent_child: boolean;
  has_5_absences: boolean;
}

export interface IncidentFormData {
  student_id: string;
  incident_date: string;
  incident_category: SessionCategory;
  description: string;
}

export interface SessionFormData {
  student_id: string;
  session_date: string;
  category: SessionCategory;
  private_notes: string;
  action_plan: string;
  follow_up_date: string;
  parent_session_id?: string | null;
  previous_private_notes?: string;
  previous_action_plan?: string;
  previous_session_date?: string;
}

export interface CallSlipData {
  studentName: string;
  gradeLevel: number;
  section: string;
  requestedDate: string;
  requestedTime: string;
  purpose: string;
  counselorName: string;
}
