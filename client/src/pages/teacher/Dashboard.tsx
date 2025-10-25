import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeMessage from "@/components/WelcomeMessage";

export default function TeacherDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { data: teacher } = trpc.teachers.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'teacher' }
  );
  const { data: students } = trpc.students.getByTeacher.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'teacher' }
  );
  const { data: lessons } = trpc.lessons.getAll.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'teacher' }
  );
  const { data: todayAttendance } = trpc.attendance.list.useQuery(
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

  // Calculate real stats
  const studentsCount = students?.length || 0;
  const myLessons = lessons?.filter(l => l.teacherId === teacher?.id) || [];
  const lessonsCount = myLessons.length;
  
  // Get today's attendance count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const todayAttendanceCount = todayAttendance?.filter((a: any) => {
    const attDate = new Date(a.date);
    return attDate >= today && attDate <= todayEnd && a.status === 'present';
  }).length || 0;
  
  // Get next lesson time
  const now = new Date();
  const upcomingLessons = myLessons
    .filter(l => new Date(l.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextLesson = upcomingLessons[0];
  const nextLessonTime = nextLesson 
    ? new Date(nextLesson.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const statsCards = [
    {
      title: "طلابي",
      value: studentsCount,
      icon: Users,
      color: "bg-blue-500",
      description: "عدد الطلاب في حلقتي",
    },
    {
      title: "الدروس",
      value: lessonsCount,
      icon: BookOpen,
      color: "bg-emerald-500",
      description: "عدد الدروس المسجلة",
    },
    {
      title: "الحضور اليوم",
      value: todayAttendanceCount,
      icon: TrendingUp,
      color: "bg-amber-500",
      description: "عدد الحاضرين اليوم",
    },
    {
      title: "الدرس القادم",
      value: nextLessonTime,
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

        {/* Welcome Message */}
        <WelcomeMessage />

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
                <button
                  onClick={() => setLocation('/teacher/students')}
                  className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold text-sm">طلابي</p>
                </button>

                <button
                  onClick={() => setLocation('/teacher/attendance')}
                  className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold text-sm">تسجيل الحضور</p>
                </button>

                <button
                  onClick={() => setLocation('/teacher/lessons')}
                  className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <BookOpen className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold text-sm">الدروس</p>
                </button>

                <button
                  onClick={() => setLocation('/teacher/evaluations')}
                  className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold text-sm">التقييمات</p>
                </button>
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
                {myLessons
                  .filter(l => {
                    const lessonDate = new Date(l.date);
                    return lessonDate >= today && lessonDate <= todayEnd;
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((lesson, idx) => {
                    const lessonTime = new Date(lesson.date);
                    const timeStr = lessonTime.toLocaleTimeString('ar-EG', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    });
                    const colors = [
                      { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600', desc: 'text-blue-700' },
                      { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: 'text-emerald-600', desc: 'text-emerald-700' },
                      { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', icon: 'text-purple-600', desc: 'text-purple-700' },
                    ];
                    const color = colors[idx % colors.length];
                    
                    return (
                      <div key={lesson.id} className={`flex items-start gap-3 p-3 ${color.bg} rounded-lg border ${color.border}`}>
                        <Calendar className={`w-5 h-5 ${color.icon} mt-0.5`} />
                        <div className="flex-1">
                          <p className={`font-semibold ${color.text}`}>{lesson.title}</p>
                          <p className={`text-sm ${color.desc}`}>{timeStr}</p>
                          {lesson.description && (
                            <p className={`text-xs ${color.icon} mt-1`}>{lesson.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {myLessons.filter(l => {
                  const lessonDate = new Date(l.date);
                  return lessonDate >= today && lessonDate <= todayEnd;
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>لا توجد دروس مجدولة لليوم</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-emerald-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-emerald-900">النشاط الأخير</CardTitle>
                <CardDescription>آخر التحديثات والإضافات</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('recentActivity');
                  window.location.reload();
                }}
                className="text-xs"
              >
                تصفير
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                // Get recent activity from localStorage or create new
                const getRecentActivity = () => {
                  const stored = localStorage.getItem('recentActivity');
                  if (stored) {
                    return JSON.parse(stored);
                  }
                  return [];
                };

                const activities = getRecentActivity();

                // Add new activities based on real data
                const newActivities = [];

                // Check for new attendance today
                const todayAttendanceList = todayAttendance?.filter((a: any) => {
                  const attDate = new Date(a.date);
                  return attDate >= today && attDate <= todayEnd && a.status === 'present';
                }) || [];

                if (todayAttendanceList.length > 0 && !activities.some((a: any) => a.type === 'attendance' && a.date === today.toDateString())) {
                  newActivities.push({
                    type: 'attendance',
                    message: `تم تسجيل حضور ${todayAttendanceList.length} طالب`,
                    date: new Date().toISOString(),
                    color: 'emerald'
                  });
                }

                // Check for new lessons
                const recentLessons = myLessons.filter(l => {
                  const lessonDate = new Date(l.date);
                  const hoursDiff = (new Date().getTime() - lessonDate.getTime()) / (1000 * 60 * 60);
                  return hoursDiff >= 0 && hoursDiff <= 24;
                });

                if (recentLessons.length > 0 && !activities.some((a: any) => a.type === 'lesson' && new Date(a.date).toDateString() === new Date().toDateString())) {
                  newActivities.push({
                    type: 'lesson',
                    message: `تم إضافة ${recentLessons.length} درس جديد`,
                    date: new Date().toISOString(),
                    color: 'blue'
                  });
                }

                // Merge and save
                const allActivities = [...newActivities, ...activities].slice(0, 10);
                if (newActivities.length > 0) {
                  localStorage.setItem('recentActivity', JSON.stringify(allActivities));
                }

                // Display activities
                if (allActivities.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p>لا يوجد نشاط حديث</p>
                    </div>
                  );
                }

                return allActivities.slice(0, 5).map((activity: any, idx: number) => {
                  const activityDate = new Date(activity.date);
                  const now = new Date();
                  const diffMs = now.getTime() - activityDate.getTime();
                  const diffMins = Math.floor(diffMs / (1000 * 60));
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                  let timeAgo = '';
                  if (diffMins < 60) {
                    timeAgo = `منذ ${diffMins} دقيقة`;
                  } else if (diffHours < 24) {
                    timeAgo = `منذ ${diffHours} ساعة`;
                  } else if (diffDays === 1) {
                    timeAgo = 'أمس';
                  } else {
                    timeAgo = `منذ ${diffDays} يوم`;
                  }

                  const colorMap: any = {
                    emerald: 'bg-emerald-500',
                    blue: 'bg-blue-500',
                    amber: 'bg-amber-500',
                    purple: 'bg-purple-500'
                  };

                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${colorMap[activity.color] || 'bg-gray-500'}`}></div>
                      <p className="text-sm text-gray-700">{activity.message} - {timeAgo}</p>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

