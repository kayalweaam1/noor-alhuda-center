import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BookOpen, TrendingUp, Award, AlertCircle, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { data: student } = trpc.students.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'student' }
  );

  // Redirect if not student
  useEffect(() => {
    if (user && user.role !== 'student') {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  // Derive simple metrics from real data when available
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
  const behaviorScore = Math.min(100, Math.max(0, 60 + Math.floor(attendanceRate / 5)));

  const getBehaviorColor = (score: number) => {
    if (score >= 90) return "from-emerald-500 to-green-600";
    if (score >= 75) return "from-blue-500 to-cyan-600";
    if (score >= 60) return "from-amber-500 to-yellow-600";
    return "from-red-500 to-orange-600";
  };

  function getLast7DaysWithPresence(records: any[]) {
    const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const today = new Date();
    const last7: { day: string; present: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const hasPresent = records.some((r: any) => {
        const rd = new Date(r.date);
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth() && rd.getDate() === d.getDate() && r.status === 'present';
      });
      last7.push({ day: dayName, present: hasPresent });
    }
    return last7;
  }

  function StudentEvaluations({ studentId }: { studentId?: string }) {
    const { data: evals = [] } = trpc.evaluations.getByStudent.useQuery(
      { studentId: studentId as string },
      { enabled: !!studentId }
    );
    if (!studentId) return <p className="text-sm text-gray-600">لا توجد بيانات</p>;
    if (!evals.length) return <p className="text-sm text-gray-600">لا توجد تقييمات بعد</p>;
    return (
      <div className="space-y-3">
        {evals.slice(0, 5).map((e: any) => (
          <div key={e.id} className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-900">{e.evaluationType || 'تقييم'}</p>
              {e.feedback && (
                <p className="text-sm text-emerald-700 mt-1">{e.feedback}</p>
              )}
              <p className="text-xs text-emerald-600 mt-2">{new Date(e.date).toLocaleDateString('ar-SA')}</p>
            </div>
            {typeof e.score === 'number' && (
              <span className="text-sm font-bold text-emerald-700">{e.score}%</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50" dir="rtl">
      <div className="p-6 space-y-6">
        {/* Welcome Section with Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-4xl text-white font-bold">
                {user.name?.charAt(0) || 'ط'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-900">
                {user.name || 'الطالب'}
              </h1>
              <p className="text-blue-700 mt-1">
                حلقة {student?.grade || 'القرآن الكريم'}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge className="bg-blue-500">طالب</Badge>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>انضم: {student?.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('ar-SA') : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Behavior Bar */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">الشريط السلوكي</CardTitle>
            <CardDescription>تقييم السلوك والأداء</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">التقييم السلوكي</span>
                  <span className="text-2xl font-bold text-gray-900">{behaviorScore}%</span>
                </div>
                <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getBehaviorColor(behaviorScore)} transition-all duration-500 flex items-center justify-end px-4`}
                    style={{ width: `${behaviorScore}%` }}
                  >
                    <span className="text-white font-bold text-sm">
                      {behaviorScore >= 90 ? 'ممتاز' : behaviorScore >= 75 ? 'جيد جداً' : behaviorScore >= 60 ? 'جيد' : 'يحتاج تحسين'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-700 mb-1">ممتاز</p>
                  <div className="w-full h-2 bg-emerald-500 rounded"></div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-700 mb-1">جيد</p>
                  <div className="w-full h-2 bg-amber-500 rounded"></div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-700 mb-1">ضعيف</p>
                  <div className="w-full h-2 bg-red-500 rounded"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-700">نسبة الحضور</CardTitle>
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">{attendanceRate}%</div>
              <CardDescription className="text-gray-600">حضور منتظم</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-700">الدروس</CardTitle>
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">24</div>
              <CardDescription className="text-gray-600">درس مكتمل</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-700">الإنجازات</CardTitle>
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">5</div>
              <CardDescription className="text-gray-600">شارة مكتسبة</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Notes (from evaluations) */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">ملاحظات المربي</CardTitle>
            <CardDescription>آخر الملاحظات والتقييمات</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentEvaluations studentId={student?.id} />
          </CardContent>
        </Card>

        {/* Attendance Record (last 7 days) */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">سجل الحضور</CardTitle>
            <CardDescription>آخر 7 أيام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {getLast7DaysWithPresence(attendanceRecords).map((record, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-gray-600 mb-2">{record.day}</p>
                  <div
                    className={`w-full h-16 rounded-lg flex items-center justify-center ${
                      record.present
                        ? 'bg-emerald-100 border-2 border-emerald-500'
                        : 'bg-red-100 border-2 border-red-500'
                    }`}
                  >
                    {record.present ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

