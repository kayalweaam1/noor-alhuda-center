import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, TrendingUp, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { data: stats } = trpc.statistics.getOverview.useQuery();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'admin') {
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

  const statsCards = [
    {
      title: "إجمالي الطلاب",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "bg-blue-500",
      description: "عدد الطلاب المسجلين",
    },
    {
      title: "المربين",
      value: stats?.totalTeachers || 0,
      icon: GraduationCap,
      color: "bg-emerald-500",
      description: "عدد المربين النشطين",
    },
    {
      title: "الدروس",
      value: stats?.totalLessons || 0,
      icon: BookOpen,
      color: "bg-amber-500",
      description: "إجمالي الدروس المسجلة",
    },
    {
      title: "المستخدمين",
      value: stats?.totalUsers || 0,
      icon: TrendingUp,
      color: "bg-purple-500",
      description: "إجمالي المستخدمين",
    },
  ];

  return (
    <div className="min-h-screen" dir="rtl">
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {user.name?.charAt(0) || 'م'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">
                مرحباً، {user.name || 'المدير'}
              </h1>
              <p className="text-emerald-700 mt-1">
                لوحة التحكم الرئيسية - مركز نور الهدى
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-700">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <CardDescription className="text-gray-600">
                    {stat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart Placeholder */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900">نسبة الحضور</CardTitle>
              <CardDescription>إحصائيات الحضور الشهرية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <p className="text-emerald-700 font-semibold">رسم بياني للحضور</p>
                  <p className="text-sm text-emerald-600 mt-2">سيتم إضافة البيانات قريباً</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900">التنبيهات الأخيرة</CardTitle>
              <CardDescription>آخر الإشعارات والتحديثات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900">غياب متكرر</p>
                    <p className="text-sm text-amber-700">3 طلاب تغيبوا أكثر من 3 أيام</p>
                    <p className="text-xs text-amber-600 mt-1">منذ ساعتين</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">درس جديد</p>
                    <p className="text-sm text-blue-700">تم إضافة درس جديد في الحلقة الأولى</p>
                    <p className="text-xs text-blue-600 mt-1">منذ 5 ساعات</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <Users className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900">طالب جديد</p>
                    <p className="text-sm text-emerald-700">تم تسجيل 2 طلاب جدد اليوم</p>
                    <p className="text-xs text-emerald-600 mt-1">منذ 8 ساعات</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">إجراءات سريعة</CardTitle>
            <CardDescription>الوظائف الأكثر استخداماً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">إدارة المستخدمين</p>
                </div>
              </Link>

              <Link href="/admin/teachers">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">إدارة المربين</p>
                </div>
              </Link>

              <Link href="/admin/students">
                <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">إدارة الطلاب</p>
                </div>
              </Link>

              <Link href="/admin/reports">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <BookOpen className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">التقارير</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

