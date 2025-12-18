import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Wrench, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function DataFixPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isFixing, setIsFixing] = useState(false);
  const [fixResults, setFixResults] = useState<string[]>([]);

  const { data: students, refetch: refetchStudents } = trpc.students.getAll.useQuery();
  const { data: teachers, refetch: refetchTeachers } = trpc.teachers.getAll.useQuery();
  const deleteStudent = trpc.students.delete.useMutation();
  const updateStudent = trpc.students.update.useMutation();
  const updateTeacher = trpc.teachers.update.useMutation();

  // Redirect if not super admin
  useEffect(() => {
    if (user && (user.role !== 'admin' || user.phone !== '+972542632557')) {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'admin' || user.phone !== '+972542632557') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h2>
          <p className="text-gray-600">هذه الصفحة متاحة فقط للمدير العام</p>
        </div>
      </div>
    );
  }

  // Find issues
  const studentsWithoutName = students?.filter(s => !s.name || s.name.trim() === '') || [];
  const studentsWithoutTeacher = students?.filter(s => !s.teacherId) || [];
  const teachersWithoutCreatedAt = teachers?.filter(t => !t.createdAt) || [];

  const handleFixAll = async () => {
    setIsFixing(true);
    setFixResults([]);
    const results: string[] = [];

    try {
      // 1. Delete students without name
      if (studentsWithoutName.length > 0) {
        results.push(`🔍 وجدت ${studentsWithoutName.length} طالب بدون اسم`);
        for (const student of studentsWithoutName) {
          try {
            await deleteStudent.mutateAsync({ id: student.id });
            results.push(`✅ تم حذف الطالب بدون اسم (ID: ${student.id})`);
          } catch (error: any) {
            results.push(`❌ فشل حذف الطالب (ID: ${student.id}): ${error.message}`);
          }
        }
      } else {
        results.push('✅ لا يوجد طلاب بدون اسم');
      }

      // 2. Assign teacher to students without teacher
      if (studentsWithoutTeacher.length > 0 && teachers && teachers.length > 0) {
        const firstTeacher = teachers[0];
        results.push(`🔍 وجدت ${studentsWithoutTeacher.length} طالب بدون مربي`);
        results.push(`📌 سيتم تعيينهم للمربي: ${firstTeacher.name || 'المربي الأول'}`);
        
        for (const student of studentsWithoutTeacher) {
          try {
            await updateStudent.mutateAsync({
              id: student.id,
              teacherId: firstTeacher.id,
            });
            results.push(`✅ تم تعيين مربي للطالب: ${student.name || student.id}`);
          } catch (error: any) {
            results.push(`❌ فشل تعيين مربي للطالب ${student.name}: ${error.message}`);
          }
        }
      } else if (studentsWithoutTeacher.length > 0) {
        results.push('⚠️ يوجد طلاب بدون مربي لكن لا يوجد مربين في النظام!');
      } else {
        results.push('✅ جميع الطلاب لديهم مربي');
      }

      // 3. Add createdAt to teachers without it
      if (teachersWithoutCreatedAt.length > 0) {
        results.push(`🔍 وجدت ${teachersWithoutCreatedAt.length} مربي بدون تاريخ تسجيل`);
        
        for (const teacher of teachersWithoutCreatedAt) {
          try {
            // Note: We can't update createdAt directly, but we can note it
            results.push(`⚠️ المربي ${teacher.name || teacher.id} بدون تاريخ تسجيل (يتطلب تحديث يدوي في قاعدة البيانات)`);
          } catch (error: any) {
            results.push(`❌ خطأ: ${error.message}`);
          }
        }
      } else {
        results.push('✅ جميع المربين لديهم تاريخ تسجيل');
      }

      results.push('');
      results.push('🎉 اكتمل الإصلاح!');
      
      // Refetch data
      await refetchStudents();
      await refetchTeachers();
      
      toast.success('تم إصلاح البيانات بنجاح');
    } catch (error: any) {
      results.push(`❌ خطأ عام: ${error.message}`);
      toast.error('حدث خطأ أثناء الإصلاح');
    }

    setFixResults(results);
    setIsFixing(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إصلاح البيانات</h1>
          <p className="text-gray-600 mt-1">أدوات إصلاح المشاكل في قاعدة البيانات</p>
        </div>
        <Wrench className="w-12 h-12 text-orange-600" />
      </div>

      {/* Issues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={studentsWithoutName.length > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <CardContent className="pt-6">
            <div className="text-center">
              {studentsWithoutName.length > 0 ? (
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              )}
              <p className="text-sm text-gray-700 mb-1">طلاب بدون اسم</p>
              <p className="text-4xl font-bold text-gray-900">{studentsWithoutName.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={studentsWithoutTeacher.length > 0 ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
          <CardContent className="pt-6">
            <div className="text-center">
              {studentsWithoutTeacher.length > 0 ? (
                <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              )}
              <p className="text-sm text-gray-700 mb-1">طلاب بدون مربي</p>
              <p className="text-4xl font-bold text-gray-900">{studentsWithoutTeacher.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={teachersWithoutCreatedAt.length > 0 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}>
          <CardContent className="pt-6">
            <div className="text-center">
              {teachersWithoutCreatedAt.length > 0 ? (
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              )}
              <p className="text-sm text-gray-700 mb-1">مربين بدون تاريخ</p>
              <p className="text-4xl font-bold text-gray-900">{teachersWithoutCreatedAt.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fix Actions */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">إجراءات الإصلاح</CardTitle>
          <CardDescription>سيتم تنفيذ الإصلاحات التالية:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">حذف الطلاب بدون اسم</p>
                <p className="text-sm text-gray-600">سيتم حذف {studentsWithoutName.length} طالب بدون اسم من قاعدة البيانات</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">تعيين مربي للطلاب</p>
                <p className="text-sm text-gray-600">سيتم تعيين مربي لـ {studentsWithoutTeacher.length} طالب بدون مربي</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">إضافة تاريخ تسجيل للمربين</p>
                <p className="text-sm text-gray-600">سيتم تسجيل {teachersWithoutCreatedAt.length} مربي بدون تاريخ (ملاحظة فقط)</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleFixAll}
              disabled={isFixing || (studentsWithoutName.length === 0 && studentsWithoutTeacher.length === 0 && teachersWithoutCreatedAt.length === 0)}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isFixing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  جاري الإصلاح...
                </>
              ) : (
                <>
                  <Wrench className="w-5 h-5 mr-2" />
                  تنفيذ جميع الإصلاحات
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {fixResults.length > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">نتائج الإصلاح</CardTitle>
            <CardDescription>سجل العمليات المنفذة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
              {fixResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details */}
      {studentsWithoutName.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">تفاصيل: طلاب بدون اسم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {studentsWithoutName.map(student => (
                <div key={student.id} className="p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-sm">
                    <span className="font-medium">ID:</span> {student.id}<br />
                    <span className="font-medium">الصف:</span> {student.grade || 'غير محدد'}<br />
                    <span className="font-medium">رقم الهاتف:</span> {student.phone || 'لا يوجد'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {studentsWithoutTeacher.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900">تفاصيل: طلاب بدون مربي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {studentsWithoutTeacher.map(student => (
                <div key={student.id} className="p-3 bg-orange-50 rounded border border-orange-200">
                  <p className="text-sm">
                    <span className="font-medium">الاسم:</span> {student.name || 'غير محدد'}<br />
                    <span className="font-medium">الصف:</span> {student.grade || 'غير محدد'}<br />
                    <span className="font-medium">رقم الهاتف:</span> {student.phone || 'لا يوجد'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
