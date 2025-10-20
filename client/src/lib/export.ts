// Export data to Excel/CSV
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert("لا توجد بيانات للتصدير");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csv = headers.join(",") + "\n";
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csv += values.join(",") + "\n";
  });

  // Create download link
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export students data
export function exportStudents(students: any[]) {
  const data = students.map(student => ({
    "الاسم": student.user?.name || "",
    "رقم الهاتف": student.user?.phone || "",
    "الحلقة": student.halaqaName || "",
    "الصف": student.grade || "",
    "رقم ولي الأمر": student.parentPhone || "",
    "العنوان": student.address || "",
  }));
  
  exportToCSV(data, `students_${new Date().toISOString().split('T')[0]}`);
}

// Export teachers data
export function exportTeachers(teachers: any[]) {
  const data = teachers.map(teacher => ({
    "الاسم": teacher.user?.name || "",
    "رقم الهاتف": teacher.user?.phone || "",
    "الحلقة": teacher.halaqaName || "",
    "التخصص": teacher.specialization || "",
  }));
  
  exportToCSV(data, `teachers_${new Date().toISOString().split('T')[0]}`);
}

// Export attendance data
export function exportAttendance(attendance: any[]) {
  const data = attendance.map(record => ({
    "الطالب": record.student?.user?.name || "",
    "التاريخ": new Date(record.date).toLocaleDateString('ar'),
    "الحالة": record.status === 'present' ? 'حاضر' : record.status === 'absent' ? 'غائب' : 'متأخر',
    "المربي": record.teacher?.user?.name || "",
  }));
  
  exportToCSV(data, `attendance_${new Date().toISOString().split('T')[0]}`);
}

// Parse CSV file
export function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error("الملف فارغ أو غير صالح"));
          return;
        }
        
        // Parse headers
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
        
        // Parse rows
        const data = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("فشل في قراءة الملف"));
    reader.readAsText(file, "UTF-8");
  });
}

