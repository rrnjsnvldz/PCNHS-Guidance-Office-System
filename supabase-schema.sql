-- ============================================================
-- PCNHS Guidance Office & Student Profiling System
-- Supabase SQL Migration Script v1.0
-- Option A (Core MVP) — Schema designed for modular upgrade
-- ============================================================

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('guidance_admin', 'adviser_teacher');
CREATE TYPE referral_status AS ENUM ('pending_review', 'under_counseling', 'resolved', 'dismissed');
CREATE TYPE session_category AS ENUM ('behavioral', 'academic_sardo', 'personal_emotional', 'career_exit', 'parent_conference');

-- 2. USER PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'adviser_teacher',
    grade_assigned INT,
    section_assigned TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENTS MASTER TABLE
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lrn VARCHAR(12) UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    grade_level INT NOT NULL,
    section TEXT NOT NULL,
    gender TEXT,
    birthdate DATE,
    guardian_name TEXT,
    guardian_contact TEXT,

    -- Client Custom Tags (Future upgrade hooks)
    is_sardo BOOLEAN DEFAULT FALSE,
    is_4ps BOOLEAN DEFAULT FALSE,
    is_ip_sped BOOLEAN DEFAULT FALSE,
    is_working_student BOOLEAN DEFAULT FALSE,
    has_recurring_behavior BOOLEAN DEFAULT FALSE,
    is_pwd BOOLEAN DEFAULT FALSE,
    is_solo_parent_child BOOLEAN DEFAULT FALSE,
    has_5_absences BOOLEAN DEFAULT FALSE,

    -- Good Moral Awards Array
    good_moral_awards TEXT[] DEFAULT '{}',

    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TEACHER INCIDENT REFERRALS
CREATE TABLE incident_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    referred_by UUID REFERENCES profiles(id),
    incident_date TIMESTAMPTZ DEFAULT NOW(),
    incident_category session_category NOT NULL,
    description TEXT NOT NULL,
    status referral_status DEFAULT 'pending_review',
    guidance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONFIDENTIAL COUNSELING SESSIONS (Guidance Only)
CREATE TABLE counseling_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    counselor_id UUID REFERENCES profiles(id),
    session_date TIMESTAMPTZ DEFAULT NOW(),
    category session_category NOT NULL,
    private_notes TEXT NOT NULL,
    action_plan TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATTACHMENT METADATA (Future upgrade hook)
CREATE TABLE student_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_students_lrn ON students(lrn);
CREATE INDEX idx_students_grade_section ON students(grade_level, section);
CREATE INDEX idx_students_name ON students(last_name, first_name);
CREATE INDEX idx_referrals_student ON incident_referrals(student_id);
CREATE INDEX idx_referrals_status ON incident_referrals(status);
CREATE INDEX idx_sessions_student ON counseling_sessions(student_id);
CREATE INDEX idx_sessions_date ON counseling_sessions(session_date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attachments ENABLE ROW LEVEL SECURITY;

-- Guidance Admins: Full CRUD on all tables
CREATE POLICY "Guidance Full Access Profiles" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'guidance_admin')
);

CREATE POLICY "Guidance Full Access Students" ON students FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'guidance_admin')
);

CREATE POLICY "Guidance Full Access Referrals" ON incident_referrals FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'guidance_admin')
);

CREATE POLICY "Guidance Full Access Counseling" ON counseling_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'guidance_admin')
);

CREATE POLICY "Guidance Full Access Attachments" ON student_attachments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'guidance_admin')
);

-- Teachers: Read students, insert/view own referrals
CREATE POLICY "Teacher Read Students" ON students FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'adviser_teacher')
);

CREATE POLICY "Teacher Insert Referrals" ON incident_referrals FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'adviser_teacher')
);

CREATE POLICY "Teacher View Own Referrals" ON incident_referrals FOR SELECT USING (
    referred_by = auth.uid()
);

-- ============================================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP (Trigger Function)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _role user_role := 'guidance_admin';
    _role_text TEXT;
BEGIN
    -- Safely extract role from metadata, default to guidance_admin
    _role_text := NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), '');
    IF _role_text IS NOT NULL THEN
        BEGIN
            _role := _role_text::user_role;
        EXCEPTION WHEN OTHERS THEN
            _role := 'guidance_admin';
        END;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), NEW.email),
        _role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
