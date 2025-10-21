import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminStudentDetails() {
  const [, params] = useRoute("/admin/students/:id");
  const id = params?.id ?? "";
  const { data: student, isLoading } = trpc.students.getById.useQuery({ id }, { enabled: !!id });
  const { data: attendance } = trpc.attendance.getByStudent.useQuery({ studentId: id }, { enabled: !!id });
  const { data: evaluations } = trpc.evaluations.getByStudent.useQuery({ studentId: id }, { enabled: !!id });

  return (
    <div className="p-6" dir="rtl">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">تفاصيل الطالب</CardTitle>
          <CardDescription>معلومات عامة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
          ) : !student ? (
            <div className="text-center py-12 text-gray-500">لم يتم العثور على الطالب</div>
          ) : (
            <div className="space-y-2">
              <div className="font-semibold text-gray-900">{student.userName || "غير محدد"}</div>
              <div className="text-gray-700">الهاتف: {student.userPhone || "-"}</div>
              <div className="text-gray-700">المرحلة: {(student as any).grade || "-"}</div>
              <div className="pt-4">
                <Link href="/admin/students">
                  <Button variant="outline" className="border-emerald-200">الرجوع لقائمة الطلاب</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">الحضور</CardTitle>
            <CardDescription>آخر السجلات</CardDescription>
          </CardHeader>
          <CardContent>
            {!attendance || attendance.length === 0 ? (
              <div className="text-gray-500">لا توجد سجلات</div>
            ) : (
              <div className="space-y-2">
                {attendance.slice(0, 10).map((a) => (
                  <div key={a.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{new Date(a.date).toLocaleDateString('ar-SA')}</span>
                    <span className="font-medium text-emerald-700">{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">التقييمات</CardTitle>
            <CardDescription>آخر 10 تقييمات</CardDescription>
          </CardHeader>
          <CardContent>
            {!evaluations || evaluations.length === 0 ? (
              <div className="text-gray-500">لا توجد تقييمات</div>
            ) : (
              <div className="space-y-2">
                {evaluations.slice(0, 10).map((e) => (
                  <div key={e.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{new Date(e.date).toLocaleDateString('ar-SA')}</span>
                    <span className="font-medium text-emerald-700">{e.score ?? '-'}</span>
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
