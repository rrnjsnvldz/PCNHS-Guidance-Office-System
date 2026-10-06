-- ============================================================
-- PCNHS Guidance Office System — Seed Data (Dummy Records)
-- Run this in Supabase SQL Editor after schema is set up
-- ============================================================

-- =============================
-- CLEAR EXISTING DATA
-- =============================
TRUNCATE TABLE counseling_sessions, incident_referrals, students RESTART IDENTITY CASCADE;

-- =============================
-- STUDENTS (20 sample students)
-- =============================
INSERT INTO students (lrn, first_name, last_name, middle_name, grade_level, section, gender, birthdate, guardian_name, guardian_contact, is_sardo, is_4ps, is_pwd, is_ip_sped, is_working_student, is_solo_parent_child, has_recurring_behavior, has_5_absences) VALUES
('301245678901', 'Juan Carlos',   'Dela Cruz',    'Santos',     7,  'Rizal',       'Male',   '2012-03-15', 'Maria Dela Cruz',       '09171234567', false, true,  false, false, false, false, false, false),
('301245678902', 'Maria Angela',  'Reyes',        'Lopez',      7,  'Rizal',       'Female', '2012-07-22', 'Roberto Reyes',         '09189876543', false, false, false, false, false, false, false, false),
('301245678903', 'Mark Anthony',  'Garcia',       'Mendoza',    7,  'Mabini',      'Male',   '2012-01-08', 'Elena Garcia',          '09201112233', true,  false, false, false, false, false, true,  false),
('301245678904', 'Princess Joy',  'Santos',       'Rivera',     8,  'Bonifacio',   'Female', '2011-11-30', 'Pedro Santos',          '09334455667', false, true,  false, false, false, true,  false, false),
('301245678905', 'John Patrick',  'Bautista',     'Cruz',       8,  'Bonifacio',   'Male',   '2011-05-17', 'Lorna Bautista',        '09165544332', false, false, false, false, true,  false, false, true),
('301245678906', 'Alyssa Marie',  'Fernandez',    'Castillo',   8,  'Aguinaldo',   'Female', '2011-09-03', 'Ricardo Fernandez',     '09277766554', false, false, false, false, false, false, false, false),
('301245678907', 'Kyle Justin',   'Villanueva',   'Ramos',      9,  'Jacinto',     'Male',   '2010-06-25', 'Gloria Villanueva',     '09188899001', false, true,  false, false, false, false, true,  true),
('301245678908', 'Jasmine',       'Aquino',       'Torres',     9,  'Jacinto',     'Female', '2010-12-11', 'Dennis Aquino',         '09052233445', false, false, false, false, false, false, false, false),
('301245678909', 'Renz Andrei',   'Mendoza',      'Lim',        9,  'Luna',        'Male',   '2010-04-02', 'Susana Mendoza',        '09173344556', true,  false, false, true,  false, false, false, false),
('301245678910', 'Trisha Mae',    'Rivera',       'Gonzales',   10, 'Silang',      'Female', '2009-08-19', 'Antonio Rivera',        '09264455667', false, false, true,  false, false, false, false, false),
('301245678911', 'Christian',     'Lopez',        'Dimaculangan',10,'Silang',      'Male',   '2009-02-14', 'Maricel Lopez',         '09395566778', false, true,  false, false, false, false, false, false),
('301245678912', 'Angelica',      'Torres',       'Manalo',     10, 'Del Pilar',   'Female', '2009-10-28', 'Fernando Torres',       '09186677889', false, false, false, false, false, true,  false, false),
('301245678913', 'James Carlo',   'Ramos',        'Pascual',    11, 'STEM-A',      'Male',   '2008-07-07', 'Rosario Ramos',         '09057788990', false, false, false, false, true,  false, true,  false),
('301245678914', 'Kyla Nicole',   'Castro',       'Villanueva', 11, 'STEM-A',      'Female', '2008-01-23', 'Eduardo Castro',        '09178899001', false, false, false, false, false, false, false, false),
('301245678915', 'Miguel',        'Gonzales',     'Santiago',   11, 'ABM-A',       'Male',   '2008-04-16', 'Carmela Gonzales',      '09289900112', false, true,  false, false, false, false, false, true),
('301245678916', 'Samantha',      'Hernandez',    'Bautista',   11, 'HUMSS-A',     'Female', '2008-11-05', 'Jonathan Hernandez',    '09060011223', true,  false, false, false, false, false, false, false),
('301245678917', 'Enzo Rafael',   'Pascual',      'Cruz',       12, 'STEM-B',      'Male',   '2007-03-29', 'Patricia Pascual',      '09171122334', false, false, false, false, false, false, true,  false),
('301245678918', 'Bianca',        'Santiago',     'Reyes',      12, 'STEM-B',      'Female', '2007-08-14', 'Manuel Santiago',        '09282233445', false, false, false, false, false, false, false, false),
('301245678919', 'Ralph Dominic', 'Cruz',         'Garcia',     12, 'ABM-B',       'Male',   '2007-12-01', 'Cynthia Cruz',          '09393344556', false, true,  false, false, true,  false, false, true),
('301245678920', 'Althea',        'Manalo',       'Fernandez',  12, 'HUMSS-B',     'Female', '2007-05-20', 'Vincent Manalo',        '09064455667', false, false, false, false, false, true,  false, false);

-- =============================
-- INCIDENT REFERRALS (10 sample)
-- =============================
INSERT INTO incident_referrals (student_id, incident_date, incident_category, description, status, guidance_notes) VALUES
(
  (SELECT id FROM students WHERE lrn = '301245678903'),
  '2026-09-15 08:30:00+08',
  'behavioral',
  'Student was involved in a verbal altercation with a classmate during recess. Both students were brought to the prefect of discipline.',
  'resolved',
  'Mediation conducted. Both students apologized and agreed to maintain respectful communication.'
),
(
  (SELECT id FROM students WHERE lrn = '301245678907'),
  '2026-09-20 10:15:00+08',
  'behavioral',
  'Caught using mobile phone during class hours despite repeated warnings. Phone was confiscated by the teacher.',
  'under_counseling',
  'Scheduled counseling session. Parent to be notified about school phone policy.'
),
(
  (SELECT id FROM students WHERE lrn = '301245678905'),
  '2026-09-22 14:00:00+08',
  'academic_sardo',
  'Student has accumulated 5 consecutive absences without any excuse letter or parent notification.',
  'under_counseling',
  NULL
),
(
  (SELECT id FROM students WHERE lrn = '301245678913'),
  '2026-09-25 09:45:00+08',
  'behavioral',
  'Reported bullying incident — student was seen intimidating a junior student near the canteen area.',
  'pending_review',
  NULL
),
(
  (SELECT id FROM students WHERE lrn = '301245678917'),
  '2026-09-28 11:30:00+08',
  'personal_emotional',
  'Student broke down crying during class and expressed feelings of anxiety about upcoming exams and family issues at home.',
  'under_counseling',
  'Initial talk done. Follow-up session scheduled. Student agreed to visit guidance office weekly.'
),
(
  (SELECT id FROM students WHERE lrn = '301245678901'),
  '2026-10-01 08:00:00+08',
  'behavioral',
  'Student was found loitering outside the classroom during first period. Claims to have lost class schedule.',
  'resolved',
  'Provided copy of class schedule. Reminded about school attendance policy.'
),
(
  (SELECT id FROM students WHERE lrn = '301245678915'),
  '2026-10-02 13:20:00+08',
  'academic_sardo',
  'Teacher reported consistent failure to submit requirements in 3 subjects. Student seems disengaged from schoolwork.',
  'pending_review',
  NULL
),
(
  (SELECT id FROM students WHERE lrn = '301245678910'),
  '2026-10-03 10:00:00+08',
  'personal_emotional',
  'Student requested to speak with guidance counselor regarding issues at home affecting concentration in class.',
  'resolved',
  'Confidential session held. Student was given coping strategies and a follow-up was scheduled.'
),
(
  (SELECT id FROM students WHERE lrn = '301245678919'),
  '2026-10-04 09:00:00+08',
  'behavioral',
  'Dress code violation reported for the third time this quarter. Student not wearing proper school uniform.',
  'pending_review',
  NULL
),
(
  (SELECT id FROM students WHERE lrn = '301245678904'),
  '2026-10-05 14:30:00+08',
  'parent_conference',
  'Guardian requested a meeting to discuss student performance and frequent tardiness. Parent conference scheduled.',
  'pending_review',
  NULL
);

-- =============================
-- COUNSELING SESSIONS (6 sample)
-- =============================
INSERT INTO counseling_sessions (student_id, session_date, category, private_notes, action_plan, follow_up_date) VALUES
(
  (SELECT id FROM students WHERE lrn = '301245678903'),
  '2026-09-16 10:00:00+08',
  'behavioral',
  'Student expressed frustration about being teased by classmates. Admitted to reacting aggressively but showed remorse. Discussed proper conflict resolution strategies including walking away and seeking adult help. Student appears to have underlying anger management concerns that may need further sessions.',
  'Refer to weekly check-ins. Monitor behavior in classroom. Coordinate with adviser for behavioral observation.',
  '2026-09-23'
),
(
  (SELECT id FROM students WHERE lrn = '301245678907'),
  '2026-09-22 09:30:00+08',
  'behavioral',
  'Student admits to phone use in class. States it was to check messages from working parent abroad (OFW). Shows signs of separation anxiety. Discussed importance of following school rules while acknowledging emotional needs. Student was receptive.',
  'Allow student to use phone during designated break times only. Coordinate with class adviser. Consider referral to DRRM focal if emotional issues persist.',
  '2026-10-06'
),
(
  (SELECT id FROM students WHERE lrn = '301245678905'),
  '2026-09-24 14:00:00+08',
  'academic_sardo',
  'Student revealed that absences were due to helping family with farming during harvest season. Working student status confirmed. Student expressed desire to continue schooling but feels conflicted about family responsibilities. Guardian was contacted and expressed willingness to cooperate.',
  'Coordinate with DRRM and class adviser for flexible deadline arrangements. Monitor attendance weekly. Guardian to ensure student attends minimum required school days.',
  '2026-10-08'
),
(
  (SELECT id FROM students WHERE lrn = '301245678917'),
  '2026-09-30 10:00:00+08',
  'personal_emotional',
  'Student opened up about parents separating. Experiencing anxiety, difficulty sleeping, and loss of appetite. Academic performance declining due to inability to concentrate. Student agreed to weekly sessions. No self-harm ideation reported. Emotional support and active listening provided.',
  'Weekly counseling sessions every Tuesday 10 AM. Provide stress management handout. Coordinate with subject teachers for academic support. Monitor closely for signs of depression.',
  '2026-10-07'
),
(
  (SELECT id FROM students WHERE lrn = '301245678910'),
  '2026-10-03 10:30:00+08',
  'personal_emotional',
  'Student confided about domestic issues — frequent arguments between parents at home. Student feels unsafe and distracted. No physical abuse reported. Student has a support system with grandmother who lives nearby. Coping strategies discussed.',
  'Continue monitoring. Grandmother identified as emergency contact/support. Student advised to approach guidance office anytime. Schedule follow-up in 2 weeks.',
  '2026-10-17'
),
(
  (SELECT id FROM students WHERE lrn = '301245678916'),
  '2026-10-05 13:00:00+08',
  'career_exit',
  'Student is exploring career options in healthcare. Interested in nursing but concerned about financial feasibility. Discussed scholarship opportunities and DepEd programs. Student was enthusiastic about the DOST scholarship option. Provided brochure and application checklist.',
  'Provide DOST-SEI scholarship application form. Schedule career aptitude assessment. Connect with school career guidance focal person.',
  '2026-10-19'
);
