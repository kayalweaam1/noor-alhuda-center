import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Phone, Mail, Calendar, BookOpen, Users } from "lucide-react";
import BackButton from "@/components/BackButton";
import BehaviorProgressBar from "@/components/BehaviorProgressBar";

export default function UserDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading } = trpc.users.getById.useQuery({ id: id! });
  const { data: student } = trpc.students.getById.useQuery({ id: id! }, { enabled: !!user && user.role === 'student' });
  const { data: teacher } = trpc.teachers.getByUserId.useQuery({ userId: id! }, { enabled: !!user && user.role === 'teacher' });
  const { data: behaviorScore } = trpc.evaluations.getBehaviorScore.useQuery(
    { studentId: student?.id || '' },
    { enabled: !!student }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">المستخدم غير موجود</div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    admin: 'مدير',
    teacher: 'مربي',
    student: 'طالب',
    assistant: 'مساعد',
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <BackButton />
      
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <User className="w-8 h-8 text-emerald-600" />
              معلومات المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">الاسم</label>
                <p className="text-lg">{user.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-600">الدور</label>
                <p className="text-lg">{roleLabels[user.role]}</p>
              </div>
              
              {user.username && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">اسم المستخدم</label>
                  <p className="text-lg font-mono">{user.username}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-semibold text-gray-600">رقم الهاتف</label>
                <p className="text-lg font-mono">{user.phone}</p>
              </div>
              
              {user.email && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">البريد الإلكتروني</label>
                  <p className="text-lg">{user.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {teacher && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                معلومات المربي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">اسم الحلقة</label>
                <p className="text-lg">{teacher.halaqaName || 'غير محدد'}</p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-600">التخصص</label>
                <p className="text-lg">{teacher.specialization || 'غير محدد'}</p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-600">الصف</label>
                <p className="text-lg">{teacher.grade}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {student && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-600" />
                معلومات الطالب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">الصف</label>
                <p className="text-lg">{student.grade}</p>
              </div>
              
              {student.teacherId && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">المربي</label>
                  <p className="text-lg">معرف المربي: {student.teacherId}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-semibold text-gray-600">التخصص</label>
                <p className="text-lg">{student.specialization || 'غير محدد'}</p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-600">حالة الدفع</label>
                <p className="text-lg">{student.hasPaid ? '✅ تم الدفع' : '❌ لم يتم الدفع'}</p>
              </div>
              
              {behaviorScore && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">
                    التقييم السلوكي ({behaviorScore.count} تقييم)
                  </label>
                  <BehaviorProgressBar score={behaviorScore.score} size="lg" />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

