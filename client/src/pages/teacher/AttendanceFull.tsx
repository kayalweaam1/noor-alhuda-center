import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AttendanceFull() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: teacher } = trpc.teachers.getMyProfile.useQuery(undefined, {
    enabled: !!user?.id && user?.role === "teacher",
  });
  const { data: students, refetch } = trpc.students.getByTeacher.useQuery(
    undefined,
    { enabled: !!teacher?.id }
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState<
    Record<string, "present" | "absent" | "late">
  >({});

  const markAttendanceMutation = trpc.attendance.mark.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الحضور بنجاح");
      refetch();
    },
    onError: (error: any) => {
      toast.error("فشل في تسجيل الحضور: " + error.message);
    },
  });

  const handleAttendanceChange = (
    studentId: string,
    status: "present" | "absent" | "late"
  ) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = () => {
    if (!teacher) {
      toast.error("لم يتم العثور على بيانات المربي");
      return;
    }

    const entries = Object.entries(attendance);
    if (entries.length === 0) {
      toast.error("يرجى تحديد حضور الطلاب");
      return;
    }

    // Submit each attendance record
    entries.forEach(([studentId, status]) => {
      markAttendanceMutation.mutate({
        studentId,
        date: selectedDate,
        status,
        teacherId: teacher.id,
      });
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-emerald-600" />
          تسجيل الحضور
        </h1>
        <p className="text-gray-600 mt-2">سجل حضور وغياب الطلاب</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>حضور اليوم</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <label className="text-sm font-medium">التاريخ:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="border rounded px-3 py-1"
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!students || students.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              لا يوجد طلاب في حلقتك
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.user?.name || "غير محدد"}
                      </TableCell>
                      <TableCell>
                        {attendance[student.id] === "present" && (
                          <Badge className="bg-green-500">حاضر</Badge>
                        )}
                        {attendance[student.id] === "absent" && (
                          <Badge className="bg-red-500">غائب</Badge>
                        )}
                        {attendance[student.id] === "late" && (
                          <Badge className="bg-yellow-500">متأخر</Badge>
                        )}
                        {!attendance[student.id] && (
                          <Badge variant="outline">لم يتم التحديد</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={
                              attendance[student.id] === "present"
                                ? "default"
                                : "outline"
                            }
                            className={
                              attendance[student.id] === "present"
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                            onClick={() =>
                              handleAttendanceChange(student.id, "present")
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              attendance[student.id] === "late"
                                ? "default"
                                : "outline"
                            }
                            className={
                              attendance[student.id] === "late"
                                ? "bg-yellow-600 hover:bg-yellow-700"
                                : ""
                            }
                            onClick={() =>
                              handleAttendanceChange(student.id, "late")
                            }
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              attendance[student.id] === "absent"
                                ? "default"
                                : "outline"
                            }
                            className={
                              attendance[student.id] === "absent"
                                ? "bg-red-600 hover:bg-red-700"
                                : ""
                            }
                            onClick={() =>
                              handleAttendanceChange(student.id, "absent")
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={
                    markAttendanceMutation.isPending ||
                    Object.keys(attendance).length === 0
                  }
                >
                  {markAttendanceMutation.isPending
                    ? "جاري الحفظ..."
                    : "حفظ الحضور"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
