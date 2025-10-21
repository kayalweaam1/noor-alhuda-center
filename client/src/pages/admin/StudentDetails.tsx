import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminStudentDetails() {
  const [, params] = useRoute("/admin/students/:id");
  const id = params?.id ?? "";
  const { data: student, isLoading } = trpc.students.getById.useQuery({ id }, { enabled: !!id });

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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
