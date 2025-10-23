import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Mail, Calendar, TrendingUp, Award, BookOpen } from "lucide-react";

export default function TeacherMyStudents() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: user } = trpc.auth.me.useQuery();
  const { data: students } = trpc.students.list.useQuery();
  const { data: attendance } = trpc.attendance.list.useQuery();
  const { data: evaluations } = trpc.evaluations.list.useQuery();

  // حساب نسبة الحضور لكل طالب
  const getAttendanceRate = (studentId: number) => {
    if (!attendance) return 0;
    const studentAttendance = attendance.filter((a: any) => a.studentId === studentId);
    if (studentAttendance.length === 0) return 0;
    const presentCount = studentAttendance.filter((a: any) => a.status === "present").length;
    return Math.round((presentCount / studentAttendance.length) * 100);
  };

  // حساب متوسط التقييمات لكل طالب
  const getAverageRating = (studentId: number) => {
    if (!evaluations) return 0;
    const studentEvaluations = evaluations.filter((e: any) => e.studentId === studentId);
    if (studentEvaluations.length === 0) return 0;
    const sum = studentEvaluations.reduce((acc: number, e: any) => acc + e.rating, 0);
    return (sum / studentEvaluations.length).toFixed(1);
  };

  const filteredStudents = students?.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">طلابي</h1>
        <p className="text-gray-600 mt-2">قائمة الطلاب المسجلين في حلقاتك</p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length || 0}</div>
            <p className="text-xs text-muted-foreground">طالب مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الحضور</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students && students.length > 0
                ? Math.round(
                    students.reduce((acc, s) => acc + getAttendanceRate(s.id), 0) /
                      students.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">نسبة الحضور العامة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقييمات</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students && students.length > 0
                ? (
                    students.reduce((acc, s) => acc + parseFloat(getAverageRating(s.id) || "0"), 0) /
                    students.length
                  ).toFixed(1)
                : 0}
              /10
            </div>
            <p className="text-xs text-muted-foreground">من 10</p>
          </CardContent>
        </Card>
      </div>

      {/* البحث */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث عن طالب بالاسم أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* جدول الطلاب */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلاب</CardTitle>
          <CardDescription>
            جميع الطلاب المسجلين ({filteredStudents?.length || 0})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">نسبة الحضور</TableHead>
                <TableHead className="text-right">متوسط التقييم</TableHead>
                <TableHead className="text-right">تاريخ التسجيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents && filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const attendanceRate = getAttendanceRate(student.id);
                  const avgRating = getAverageRating(student.id);

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-600 font-semibold text-sm">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span dir="ltr">{student.phone || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {student.email || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            attendanceRate >= 80
                              ? "default"
                              : attendanceRate >= 60
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            attendanceRate >= 80
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : attendanceRate >= 60
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        >
                          {attendanceRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{avgRating}/10</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(student.createdAt).toLocaleDateString("ar-EG")}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد طلاب مسجلين حتى الآن"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

