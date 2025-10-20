import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function TeacherLessons() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: teacher } = trpc.teachers.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'teacher' }
  );
  const { data: lessons, refetch } = trpc.lessons.getAll.useQuery();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '09:00',
  });

  const createLessonMutation = trpc.lessons.create.useMutation();
  const deleteLessonMutation = trpc.lessons.delete.useMutation();

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
    if (!lessons || !teacher) return [];
    const date = new Date(year, month, day);
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lesson.teacherId === teacher.id &&
             lessonDate.getDate() === day &&
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

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    setShowAddDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher?.id || !selectedDate) {
      toast.error("لم يتم العثور على بيانات المربي");
      return;
    }

    try {
      // Combine date and time
      const [hours, minutes] = formData.time.split(':');
      const lessonDate = new Date(selectedDate);
      lessonDate.setHours(parseInt(hours), parseInt(minutes));

      await createLessonMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        date: lessonDate,
        teacherId: teacher.id,
      });
      
      toast.success("تم إضافة الدرس بنجاح");
      setShowAddDialog(false);
      setFormData({ title: '', description: '', time: '09:00' });
      refetch();
    } catch (error) {
      toast.error("فشل إضافة الدرس");
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;
    
    try {
      await deleteLessonMutation.mutateAsync({ id: lessonId });
      toast.success("تم حذف الدرس بنجاح");
      refetch();
    } catch (error) {
      toast.error("فشل حذف الدرس");
    }
  };

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const myLessons = lessons?.filter(l => l.teacherId === teacher?.id) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-orange-700">إجمالي دروسي</p>
              </div>
              <p className="text-4xl font-bold text-orange-900">{myLessons.length}</p>
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
                {myLessons.filter(l => {
                  const lessonDate = new Date(l.date);
                  return lessonDate.getMonth() === month && lessonDate.getFullYear() === year;
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-700">الدروس القادمة</p>
              </div>
              <p className="text-4xl font-bold text-emerald-900">
                {myLessons.filter(l => new Date(l.date) > new Date()).length}
              </p>
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
              <CardDescription>انقر على أي يوم لإضافة درس جديد</CardDescription>
            </div>
            <div className="flex items-center gap-4">
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
                  onClick={() => handleDayClick(day)}
                  className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    isToday ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  } ${dayLessons.length > 0 ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
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
                        className="text-xs p-1 bg-emerald-100 border border-emerald-300 rounded group relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="font-semibold text-emerald-900 truncate">
                          {lesson.title}
                        </div>
                        <div className="text-emerald-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(lesson.date).toLocaleTimeString('ar', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Lesson Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة درس جديد</DialogTitle>
            <DialogDescription>
              {selectedDate && `التاريخ: ${selectedDate.toLocaleDateString('ar-SA')}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>عنوان الدرس</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: حفظ سورة البقرة"
                required
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الدرس..."
                rows={3}
              />
            </div>
            <div>
              <Label>الوقت</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 ml-2" />
                إضافة الدرس
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

