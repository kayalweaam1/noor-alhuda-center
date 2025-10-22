import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Users, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddLessonModal } from "@/components/modals/AddLessonModal";

export default function AdminLessonsPage() {
  const { data: lessons } = trpc.lessons.getAll.useQuery();
  const { data: teachers } = trpc.teachers.getAll.useQuery();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddLesson, setShowAddLesson] = useState(false);

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers?.find(t => t.id === teacherId);
    return teacher?.userName || 'غير محدد';
  };

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // Get lessons for a specific date
  const getLessonsForDate = (day: number) => {
    if (!lessons) return [];
    const date = new Date(year, month, day);
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate.getDate() === day &&
             lessonDate.getMonth() === month &&
             lessonDate.getFullYear() === year;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const calendarDays = [];
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-orange-700">إجمالي الدروس</p>
              </div>
              <p className="text-4xl font-bold text-orange-900">{lessons?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-700">دروس هذا الشهر</p>
              </div>
              <p className="text-4xl font-bold text-blue-900">
                {lessons?.filter(l => {
                  const lessonDate = new Date(l.date);
                  return lessonDate.getMonth() === month && lessonDate.getFullYear() === year;
                }).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-700">المربين النشطين</p>
              </div>
              <p className="text-4xl font-bold text-emerald-900">
                {new Set(lessons?.map(l => l.teacherId)).size || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-purple-700">متوسط الحضور</p>
              </div>
              <p className="text-4xl font-bold text-purple-900">85%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-orange-900">تقويم الدروس</CardTitle>
              <CardDescription>عرض جميع دروس المربين حسب التاريخ</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowAddLesson(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                إضافة درس
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
                className="border-orange-300"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-bold text-orange-900">
                {monthNames[month]} {year}
              </h3>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="border-orange-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day names header */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center font-bold text-sm text-orange-900 p-2 bg-orange-50 rounded"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2"></div>;
              }

              const dayLessons = getLessonsForDate(day);
              const isToday = 
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`min-h-24 p-2 border rounded-lg ${
                    isToday ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  } ${dayLessons.length > 0 ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    isToday ? 'text-orange-600' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="text-xs p-1 bg-emerald-100 border border-emerald-300 rounded"
                      >
                        <div className="font-semibold text-emerald-900 truncate">
                          {lesson.title}
                        </div>
                        <div className="text-emerald-700 truncate">
                          {getTeacherName(lesson.teacherId)}
                        </div>
                        <div className="text-emerald-600">
                          {new Date(lesson.date).toLocaleTimeString('ar', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {(!lessons || lessons.length === 0) && (
            <div className="text-center py-12 mt-6">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد دروس بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Lesson Modal */}
      <AddLessonModal open={showAddLesson} onClose={() => setShowAddLesson(false)} />
    </div>
  );
}

