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
  const data = students.map(student => {
    const name = student.user?.name ?? student.userName ?? "";
    const phone = student.user?.phone ?? student.userPhone ?? "";
    const halaqa = student.halaqaName ?? student.halaqa ?? ""; // optional if available
    const grade = student.grade ?? "";
    const parentPhone = student.parentPhone ?? "";
    const address = student.address ?? "";
    const createdAt = student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar') : "";

    return {
      "الاسم": name,
      "رقم الهاتف": phone,
      "الحلقة": halaqa,
      "الصف": grade,
      "تاريخ التسجيل": createdAt,
      "رقم ولي الأمر": parentPhone,
      "العنوان": address,
    };
  });

  exportToCSV(data, `students_${new Date().toISOString().split('T')[0]}`);
}

// Export teachers data
export function exportTeachers(teachers: any[]) {
  const data = teachers.map(teacher => ({
    "الاسم": teacher.user?.name ?? teacher.userName ?? "",
    "رقم الهاتف": teacher.user?.phone ?? teacher.userPhone ?? "",
    "الحلقة": teacher.halaqaName ?? "",
    "التخصص": teacher.specialization ?? "",
    "تاريخ الإنشاء": teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('ar') : "",
  }));

  exportToCSV(data, `teachers_${new Date().toISOString().split('T')[0]}`);
}

// Export attendance data
export function exportAttendance(attendance: any[]) {
  const data = attendance.map(record => ({
    "الطالب": record.student?.user?.name ?? record.studentName ?? "",
    "التاريخ": record.date ? new Date(record.date).toLocaleDateString('ar') : "",
    "الحالة": record.status === 'present' ? 'حاضر' : record.status === 'absent' ? 'غائب' : record.status === 'late' ? 'متأخر' : (record.status || ''),
    "المربي": record.teacher?.user?.name ?? record.teacherName ?? "",
  }));

  exportToCSV(data, `attendance_${new Date().toISOString().split('T')[0]}`);
}

// Print a simple table to PDF via browser print dialog (no deps)
export function printTableReport(title: string, headers: string[], rows: (string | number)[][]) {
  const win = window.open("", "_blank");
  if (!win) return;
  const style = `
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Noto Naskh Arabic', 'Noto Sans Arabic', Arial, sans-serif; direction: rtl; padding: 24px; }
      h1 { margin-bottom: 16px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
      thead { background: #f3f4f6; }
    </style>`;
  const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c ?? ''}</td>`).join("")}</tr>`).join("")}</tbody>`;
  win.document.write(`<html><head><meta charset="utf-8"/>${style}</head><body><h1>${title}</h1><table>${thead}${tbody}</table></body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 200);
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

