import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function StudentLessons() {
  const { user } = useAuth();
  const { data: student } = trpc.students.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'student' }
  );

  // Get lessons from teacher
  const { data: lessons = [] } = trpc.lessons.getByTeacher.useQuery(
    undefined,
    { enabled: !!student?.teacherId }
  );

  const completedLessons = lessons.filter((l: any) => l.completed).length;
  const upcomingLessons = lessons.filter((l: any) => !l.completed).length;

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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">الدروس</h1>
              <p className="text-emerald-700 mt-1">متابعة دروسك في الحلقة</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">إجمالي الدروس</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-900 mb-2">{lessons.length}</div>
              <CardDescription className="text-gray-600">درس مسجل</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">دروس مكتملة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 mb-2">{completedLessons}</div>
              <CardDescription className="text-gray-600">درس منتهي</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">دروس قادمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-900 mb-2">{upcomingLessons}</div>
              <CardDescription className="text-gray-600">درس قادم</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Lessons List */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">قائمة الدروس</CardTitle>
            <CardDescription>جميع الدروس المسجلة في الحلقة</CardDescription>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد دروس مسجلة بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-emerald-900 text-lg">
                              {lesson.title || 'درس'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(lesson.date).toLocaleDateString('ar-SA', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {lesson.description && (
                          <p className="text-gray-700 mt-3 pr-13">{lesson.description}</p>
                        )}

                        {lesson.notes && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200">
                            <p className="text-sm text-gray-600">
                              <strong className="text-emerald-700">ملاحظات:</strong> {lesson.notes}
                            </p>
                          </div>
                        )}

                        {lesson.surahName && (
                          <div className="mt-3 flex items-center gap-2">
                            <Badge className="bg-emerald-600">
                              سورة {lesson.surahName}
                            </Badge>
                            {lesson.ayahFrom && lesson.ayahTo && (
                              <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                                من آية {lesson.ayahFrom} إلى {lesson.ayahTo}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mr-4">
                        {lesson.completed ? (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="w-6 h-6" />
                            <span className="text-sm font-medium">مكتمل</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-600">
                            <Clock className="w-6 h-6" />
                            <span className="text-sm font-medium">قادم</span>
                          </div>
                        )}
                      </div>
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

