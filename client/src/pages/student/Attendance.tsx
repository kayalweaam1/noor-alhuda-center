import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function StudentAttendance() {
  const { user } = useAuth();
  const { data: student } = trpc.students.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'student' }
  );

  const studentIdForQuery = student?.id ?? 'placeholder';
  const { data: attendanceRecords = [] } = trpc.attendance.getByStudent.useQuery(
    { studentId: studentIdForQuery },
    { enabled: !!student?.id }
  );

  const attendanceRate = attendanceRecords.length > 0
    ? Math.round(
        (attendanceRecords.filter((r: any) => r.status === 'present').length /
          attendanceRecords.length) * 100
      )
    : 0;

  const presentCount = attendanceRecords.filter((r: any) => r.status === 'present').length;
  const absentCount = attendanceRecords.filter((r: any) => r.status === 'absent').length;
  const lateCount = attendanceRecords.filter((r: any) => r.status === 'late').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-emerald-500">حاضر</Badge>;
      case 'absent':
        return <Badge className="bg-red-500">غائب</Badge>;
      case 'late':
        return <Badge className="bg-amber-500">متأخر</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50" dir="rtl">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-6 text-center">
        <p className="text-sm font-medium">
          مرحباً بك في مركز نور الهدى للقرآن الكريم - نتمنى لك يوماً مباركاً وموفقاً
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">سجل الحضور والغياب</h1>
              <p className="text-blue-700 mt-1">متابعة حضورك في الحلقة</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">نسبة الحضور</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 mb-2">{attendanceRate}%</div>
              <CardDescription className="text-gray-600">من إجمالي الأيام</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">أيام الحضور</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-900 mb-2">{presentCount}</div>
              <CardDescription className="text-gray-600">يوم حاضر</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">أيام الغياب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-900 mb-2">{absentCount}</div>
              <CardDescription className="text-gray-600">يوم غائب</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">التأخير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-900 mb-2">{lateCount}</div>
              <CardDescription className="text-gray-600">يوم متأخر</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">سجل الحضور الكامل</CardTitle>
            <CardDescription>جميع سجلات الحضور والغياب</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد سجلات حضور بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceRecords.map((record: any) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {record.status === 'present' && (
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                      )}
                      {record.status === 'absent' && (
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                      {record.status === 'late' && (
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(record.date).toLocaleDateString('ar-SA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {record.notes && (
                          <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

