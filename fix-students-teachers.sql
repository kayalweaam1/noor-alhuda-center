-- Fix students without teachers by assigning them to existing teachers
-- First, let's check which students don't have teachers

-- Get list of teachers
SELECT id, userId FROM teachers LIMIT 5;

-- Update students without teacherId to assign them to a teacher
-- We'll assign them to the first available teacher
UPDATE students 
SET teacherId = (SELECT id FROM teachers LIMIT 1)
WHERE teacherId IS NULL OR teacherId = '';

-- Also update payment amounts for students who have 0
UPDATE students 
SET paymentAmount = 200
WHERE paymentAmount = 0 OR paymentAmount IS NULL;

