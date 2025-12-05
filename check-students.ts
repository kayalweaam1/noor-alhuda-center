import * as db from "./server/db";

async function checkStudents() {
  
  console.log("=== فحص جميع الطلاب في قاعدة البيانات ===\n");
  
  // جلب جميع الطلاب
  const students = await db.getAllStudents();
  
  console.log(`إجمالي الطلاب: ${students.length}\n`);
  
  students.forEach((student, index) => {
    console.log(`${index + 1}. الطالب:`);
    console.log(`   ID: ${student.id}`);
    console.log(`   الاسم: ${student.fullName || 'غير محدد'}`);
    console.log(`   رقم الهاتف: ${student.phoneNumber || 'غير محدد'}`);
    console.log(`   الصف: ${student.grade || 'غير محدد'}`);
    console.log(`   المربي: ${student.teacherName || 'غير محدد'}`);
    console.log(`   المبلغ: ${student.paymentAmount || 0} ₪`);
    console.log(`   دفع: ${student.hasPaid ? 'نعم' : 'لا'}`);
    console.log(`   User ID: ${student.userId || 'غير محدد'}`);
    console.log(`   Teacher ID: ${student.teacherId || 'غير محدد'}`);
    console.log('');
  });
  
  // البحث عن الطلاب بدون بيانات
  const studentsWithoutData = students.filter(s => 
    !s.fullName || !s.phoneNumber
  );
  
  if (studentsWithoutData.length > 0) {
    console.log(`\n⚠️ طلاب بدون بيانات: ${studentsWithoutData.length}`);
    studentsWithoutData.forEach(s => {
      console.log(`   - ID: ${s.id}, User ID: ${s.userId}`);
    });
  }
  
  // البحث عن الطلاب بدون مربي
  const studentsWithoutTeacher = students.filter(s => !s.teacherId);
  
  if (studentsWithoutTeacher.length > 0) {
    console.log(`\n⚠️ طلاب بدون مربي: ${studentsWithoutTeacher.length}`);
    studentsWithoutTeacher.forEach(s => {
      console.log(`   - ${s.fullName || 'غير محدد'} (ID: ${s.id})`);
    });
  }
  
  process.exit(0);
}

checkStudents().catch(console.error);
