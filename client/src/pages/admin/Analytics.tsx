import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar,
  Award,
  Target,
  Activity,
  PieChart
} from "lucide-react";

export default function AnalyticsPage() {
  const { data: students } = trpc.students.getAll.useQuery();
  const { data: teachers } = trpc.teachers.getAll.useQuery();
  const { data: lessons } = trpc.lessons.getAll.useQuery();
  const { data: attendance } = trpc.attendance.getAll.useQuery({});
  const { data: evaluations } = trpc.evaluations.getAll.useQuery();

  // Calculate statistics
  const totalStudents = students?.length || 0;
  const totalTeachers = teachers?.length || 0;
  const totalLessons = lessons?.length || 0;
  
  const attendanceRate = attendance && attendance.length > 0
    ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
    : 0;

  const avgBehavior = 75; // Default behavior score

  const avgMemorization = evaluations && evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length
    : 0;

  const avgRecitation = evaluations && evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length
    : 0;

  const avgTajweed = avgRecitation; // Using same score

  // Calculate attendance by status
  const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
  const absentCount = attendance?.filter(a => a.status === 'absent').length || 0;
  const lateCount = 0; // Late status not in schema

  // Calculate students by halaqa
  const halaqas = students?.reduce((acc, s) => {
    const halaqa = 'الحلقة الأولى'; // Default halaqa
    acc[halaqa] = (acc[halaqa] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التحليلات المتقدمة</h1>
          <p className="text-gray-600 mt-1">تحليل شامل لأداء المركز</p>
        </div>
        <Activity className="w-12 h-12 text-blue-600" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700 mb-1">إجمالي الطلاب</p>
              <p className="text-4xl font-bold text-blue-900">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-emerald-700 mb-1">إجمالي الدروس</p>
              <p className="text-4xl font-bold text-emerald-900">{totalLessons}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 mb-1">نسبة الحضور</p>
              <p className="text-4xl font-bold text-purple-900">{attendanceRate.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-orange-700 mb-1">المربين النشطين</p>
              <p className="text-4xl font-bold text-orange-900">{totalTeachers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Scores */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              متوسط الدرجات
            </CardTitle>
            <CardDescription>متوسط أداء الطلاب في جميع المجالات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Behavior Score */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">السلوك</span>
                <span className="text-sm font-bold text-purple-600">{avgBehavior.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(avgBehavior / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Memorization Score */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">الحفظ</span>
                <span className="text-sm font-bold text-blue-600">{avgMemorization.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(avgMemorization / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Recitation Score */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">التلاوة</span>
                <span className="text-sm font-bold text-emerald-600">{avgRecitation.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(avgRecitation / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Tajweed Score */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">التجويد</span>
                <span className="text-sm font-bold text-orange-600">{avgTajweed.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(avgTajweed / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Distribution */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              توزيع الحضور
            </CardTitle>
            <CardDescription>إحصائيات الحضور والغياب</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Present */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">حاضر</span>
                <span className="text-sm font-bold text-emerald-600">{presentCount} ({((presentCount / (attendance?.length || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full"
                  style={{ width: `${(presentCount / (attendance?.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Absent */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">غائب</span>
                <span className="text-sm font-bold text-red-600">{absentCount} ({((absentCount / (attendance?.length || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                  style={{ width: `${(absentCount / (attendance?.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Late */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">متأخر</span>
                <span className="text-sm font-bold text-orange-600">{lateCount} ({((lateCount / (attendance?.length || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                  style={{ width: `${(lateCount / (attendance?.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students by Halaqa */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            توزيع الطلاب حسب الحلقات
          </CardTitle>
          <CardDescription>عدد الطلاب في كل حلقة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(halaqas).map(([halaqa, count], index) => {
              const colors = [
                'from-blue-500 to-blue-600',
                'from-emerald-500 to-emerald-600',
                'from-purple-500 to-purple-600',
                'from-orange-500 to-orange-600',
                'from-pink-500 to-pink-600',
              ];
              const color = colors[index % colors.length];
              
              return (
                <Card key={halaqa} className="border-gray-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">{count}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{halaqa}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {((count / totalStudents) * 100).toFixed(0)}% من الطلاب
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

