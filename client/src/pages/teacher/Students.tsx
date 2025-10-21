import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

export default function TeacherStudents() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: teacher } = trpc.teachers.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === "teacher" }
  );
  const { data: students } = trpc.students.getByTeacher.useQuery(
    undefined,
    { enabled: !!teacher?.id }
  );

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-emerald-900">طلابي</CardTitle>
                <CardDescription>قائمة الطلاب في حلقتك</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!students || students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">لا يوجد طلاب حالياً</div>
          ) : (
            <div className="rounded-lg border border-emerald-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50">
                    <TableHead className="text-right font-bold text-emerald-900">الطالب</TableHead>
                    <TableHead className="text-right font-bold text-emerald-900">المرحلة</TableHead>
                    <TableHead className="text-right font-bold text-emerald-900">الهاتف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s: any) => (
                    <TableRow key={s.id} className="hover:bg-emerald-50/50">
                      <TableCell className="font-medium">{s.userName || "غير محدد"}</TableCell>
                      <TableCell>{s.grade || "-"}</TableCell>
                      <TableCell>{s.userPhone || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
