import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function TeacherAttendance() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: teacher } = trpc.teachers.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'teacher' }
  );
  const { data: students } = trpc.students.getByTeacher.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'teacher' }
  );
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const createAttendanceMutation = trpc.attendance.create.useMutation();

  const handleToggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(attendance).map(([studentId, isPresent]) =>
        createAttendanceMutation.mutateAsync({
          id: `${studentId}-${selectedDate}`,
          studentId,
          date: new Date(selectedDate),
          status: isPresent ? 'present' : 'absent',
        })
      );
      
      await Promise.all(promises);
      toast.success("تم حفظ الحضور بنجاح");
      setAttendance({});
    } catch (error) {
      toast.error("فشل حفظ الحضور");
    } finally {
      setSaving(false);
    }
  };

  const myStudents = students || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">تسجيل الحضور</h1>
          <p className="text-gray-600 mt-1">تسجيل حضور وغياب الطلاب</p>
        </div>
        <Button
          onClick={handleSaveAttendance}
          disabled={saving || Object.keys(attendance).length === 0}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Save className="w-4 h-4 ml-2" />
          {saving ? "جاري الحفظ..." : "حفظ الحضور"}
        </Button>
      </div>

      {/* Date Selector */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">اختر التاريخ</CardTitle>
          <CardDescription>حدد تاريخ الحصة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 p-3 border border-emerald-200 rounded-lg focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">طلاب الحلقة</CardTitle>
          <CardDescription>
            اضغط على الطالب لتبديل الحضور/الغياب ({myStudents.length} طالب)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">لا يوجد طلاب في حلقتك</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myStudents.map((student) => {
                const isPresent = attendance[student.id] ?? false;
                return (
                  <button
                    key={student.id}
                    onClick={() => handleToggleAttendance(student.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      isPresent
                        ? 'border-emerald-500 bg-emerald-50'
                        : attendance[student.id] === false
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isPresent
                          ? 'bg-emerald-500'
                          : attendance[student.id] === false
                          ? 'bg-red-500'
                          : 'bg-gray-300'
                      }`}>
                        {isPresent ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : attendance[student.id] === false ? (
                          <XCircle className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-white font-bold">
                            {student.userName?.charAt(0) || 'ط'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-semibold text-gray-900">
                          {student.userName || 'غير محدد'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {isPresent ? 'حاضر' : attendance[student.id] === false ? 'غائب' : 'لم يتم التسجيل'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {Object.keys(attendance).length > 0 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">ملخص الحضور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <p className="text-3xl font-bold text-emerald-900">
                  {Object.values(attendance).filter(v => v).length}
                </p>
                <p className="text-sm text-emerald-700 mt-1">حاضر</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-900">
                  {Object.values(attendance).filter(v => !v).length}
                </p>
                <p className="text-sm text-red-700 mt-1">غائب</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  {myStudents.length - Object.keys(attendance).length}
                </p>
                <p className="text-sm text-gray-700 mt-1">لم يسجل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

