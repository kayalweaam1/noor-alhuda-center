-- Performance Indexes for Noor Alhuda Center Database

-- Users table indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_createdAt ON users(createdAt);

-- Teachers table indexes
CREATE INDEX idx_teachers_userId ON teachers(userId);
CREATE INDEX idx_teachers_specialization ON teachers(specialization);

-- Students table indexes
CREATE INDEX idx_students_userId ON students(userId);
CREATE INDEX idx_students_teacherId ON students(teacherId);
CREATE INDEX idx_students_grade ON students(grade);

-- Attendance table indexes
CREATE INDEX idx_attendance_studentId ON attendance(studentId);
CREATE INDEX idx_attendance_teacherId ON attendance(teacherId);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Evaluations table indexes
CREATE INDEX idx_evaluations_studentId ON evaluations(studentId);
CREATE INDEX idx_evaluations_teacherId ON evaluations(teacherId);
CREATE INDEX idx_evaluations_type ON evaluations(type);
CREATE INDEX idx_evaluations_createdAt ON evaluations(createdAt);

-- Notifications table indexes
CREATE INDEX idx_notifications_userId ON notifications(userId);
CREATE INDEX idx_notifications_isRead ON notifications(isRead);
CREATE INDEX idx_notifications_createdAt ON notifications(createdAt);

-- Lessons table indexes
CREATE INDEX idx_lessons_teacherId ON lessons(teacherId);
CREATE INDEX idx_lessons_date ON lessons(date);

-- Assistants table indexes
CREATE INDEX idx_assistants_userId ON assistants(userId);
CREATE INDEX idx_assistants_teacherId ON assistants(teacherId);

-- Assistant Notes table indexes
CREATE INDEX idx_assistantNotes_assistantId ON assistantNotes(assistantId);
CREATE INDEX idx_assistantNotes_teacherId ON assistantNotes(teacherId);
CREATE INDEX idx_assistantNotes_isRead ON assistantNotes(isRead);

-- OTP Codes table indexes
CREATE INDEX idx_otpCodes_phone ON otpCodes(phone);
CREATE INDEX idx_otpCodes_verified ON otpCodes(verified);
CREATE INDEX idx_otpCodes_expiresAt ON otpCodes(expiresAt);

