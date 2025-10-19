import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function TeacherLessons() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: teacher } = trpc.teachers.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'teacher' }
  );
  const { data: lessons, refetch } = trpc.lessons.getAll.useQuery();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const createLessonMutation = trpc.lessons.create.useMutation();
  const deleteLessonMutation = trpc.lessons.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher?.id) {
      toast.error("لم يتم العثور على بيانات المربي");
      return;
    }

    try {
      await createLessonMutation.mutateAsync({
        id: `${teacher.id}-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
      });
      
      toast.success("تم إضافة الدرس بنجاح");
      setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0] });
      setShowAddForm(false);
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

  const myLessons = lessons?.filter(l => l.teacherId === teacher?.id) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">الدروس</h1>
          <p className="text-gray-600 mt-1">إدارة دروس الحلقة</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          {showAddForm ? 'إلغاء' : 'إضافة درس'}
        </Button>
      </div>

      {/* Add Lesson Form */}
      {showAddForm && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">إضافة درس جديد</CardTitle>
            <CardDescription>أدخل تفاصيل الدرس</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  عنوان الدرس
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: سورة البقرة - الآيات 1-10"
                  required
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  وصف الدرس
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اكتب وصف الدرس والموضوعات المغطاة..."
                  rows={4}
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تاريخ الدرس
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  <BookOpen className="w-4 h-4 ml-2" />
                  حفظ الدرس
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-gray-300"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-emerald-700 mb-2">إجمالي الدروس</p>
              <p className="text-3xl font-bold text-emerald-900">{myLessons.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700 mb-2">هذا الشهر</p>
              <p className="text-3xl font-bold text-blue-900">
                {myLessons.filter(l => {
                  const lessonDate = new Date(l.date);
                  const now = new Date();
                  return lessonDate.getMonth() === now.getMonth() && 
                         lessonDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-amber-700 mb-2">هذا الأسبوع</p>
              <p className="text-3xl font-bold text-amber-900">
                {myLessons.filter(l => {
                  const lessonDate = new Date(l.date);
                  const now = new Date();
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  return lessonDate >= weekAgo && lessonDate <= now;
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lessons List */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">قائمة الدروس</CardTitle>
          <CardDescription>جميع دروس الحلقة</CardDescription>
        </CardHeader>
        <CardContent>
          {myLessons.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد دروس مسجلة</p>
              <p className="text-sm text-gray-400 mt-2">اضغط على "إضافة درس" لبدء التسجيل</p>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50">
                    <TableHead className="text-right font-bold text-emerald-900">عنوان الدرس</TableHead>
                    <TableHead className="text-right font-bold text-emerald-900">الوصف</TableHead>
                    <TableHead className="text-right font-bold text-emerald-900">التاريخ</TableHead>
                    <TableHead className="text-right font-bold text-emerald-900">الحالة</TableHead>
                    <TableHead className="text-right font-bold text-emerald-900">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLessons.map((lesson) => {
                    const lessonDate = new Date(lesson.date);
                    const isPast = lessonDate < new Date();
                    return (
                      <TableRow key={lesson.id} className="hover:bg-emerald-50/50">
                        <TableCell className="font-semibold">{lesson.title}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {lesson.description || '-'}
                        </TableCell>
                        <TableCell>
                          {lessonDate.toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <Badge className={isPast ? 'bg-gray-500' : 'bg-emerald-500'}>
                            {isPast ? 'منتهي' : 'قادم'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(lesson.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

