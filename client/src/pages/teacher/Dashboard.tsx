import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function TeacherDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { data: teacher } = trpc.teachers.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'teacher' }
  );

  // Redirect if not teacher
  useEffect(() => {
    if (user && user.role !== 'teacher') {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'teacher') {
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
      title: "طلابي",
      value: 0, // Will be replaced with real data
      icon: Users,
      color: "bg-blue-500",
      description: "عدد الطلاب في حلقتي",
    },
    {
      title: "الدروس",
      value: 0,
      icon: BookOpen,
      color: "bg-emerald-500",
      description: "عدد الدروس المسجلة",
    },
    {
      title: "الحضور اليوم",
      value: 0,
      icon: TrendingUp,
      color: "bg-amber-500",
      description: "عدد الحاضرين اليوم",
    },
    {
      title: "الدرس القادم",
      value: "--:--",
      icon: Calendar,
      color: "bg-purple-500",
      description: "موعد الدرس القادم",
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
                مرحباً، {user.name || 'المربي'}
              </h1>
              <p className="text-emerald-700 mt-1">
                لوحة التحكم - حلقة {teacher?.halaqaName || 'القرآن الكريم'}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900">إجراءات سريعة</CardTitle>
              <CardDescription>الوظائف الأكثر استخداماً</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/teacher/students">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold text-sm">طلابي</p>
                  </div>
                </Link>

                <Link href="/teacher/attendance">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold text-sm">تسجيل الحضور</p>
                  </div>
                </Link>

                <Link href="/teacher/lessons">
                  <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                    <BookOpen className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold text-sm">الدروس</p>
                  </div>
                </Link>

                <Link href="/teacher/evaluations">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold text-sm">التقييمات</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900">جدول اليوم</CardTitle>
              <CardDescription>الدروس والمواعيد</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">درس الصباح</p>
                    <p className="text-sm text-blue-700">8:00 صباحاً - 10:00 صباحاً</p>
                    <p className="text-xs text-blue-600 mt-1">حلقة {teacher?.halaqaName || 'القرآن'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900">درس المساء</p>
                    <p className="text-sm text-emerald-700">4:00 مساءً - 6:00 مساءً</p>
                    <p className="text-xs text-emerald-600 mt-1">حلقة {teacher?.halaqaName || 'القرآن'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">النشاط الأخير</CardTitle>
            <CardDescription>آخر التحديثات والإضافات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <p className="text-sm text-gray-700">تم تسجيل حضور 15 طالب - منذ ساعتين</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-sm text-gray-700">تم إضافة درس جديد - منذ 5 ساعات</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <p className="text-sm text-gray-700">تم تقييم 3 طلاب - أمس</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

