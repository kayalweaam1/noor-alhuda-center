import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminStudentDetail() {
  const [, params] = useRoute("/admin/students/:id");
  const { data: students } = trpc.students.getAll.useQuery();

  const student = students?.find((s: any) => s.id === params?.id);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl">تفاصيل الطالب</CardTitle>
        <Link href="/admin/students">
          <Button variant="outline">رجوع</Button>
        </Link>
      </div>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">{student?.userName || "غير محدد"}</CardTitle>
          <CardDescription>معرّف الطالب: {params?.id}</CardDescription>
        </CardHeader>
        <CardContent>
          {!student ? (
            <p className="text-gray-600">لم يتم العثور على الطالب.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">الهاتف</p>
                <p className="font-medium">{student.userPhone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">المرحلة</p>
                <p className="font-medium">{student.grade || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">تاريخ التسجيل</p>
                <p className="font-medium">{student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar-SA') : '-'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
