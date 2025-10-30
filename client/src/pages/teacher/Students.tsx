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
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Eye, CircleDollarSign, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLocation } from "wouter";
import BehaviorBar from "@/components/BehaviorBar";

// Component for the teacher's "My Students" page (صلابي)
export default function TeacherStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  
  // Fetch students for the logged-in teacher
  const { data: students, refetch } = trpc.students.getByTeacher.useQuery();
  
  // Mutation to update payment status
  const updatePaymentMutation = trpc.students.updatePaymentStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الدفع بنجاح");
      refetch();
    },
    onError: (error: any) => {
      toast.error("فشل تحديث حالة الدفع: " + error.message);
    }
  });

  const filteredStudents = students?.filter((student) =>
    student.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAttendanceRate = (student: any) => {
    const rate = typeof student.attendanceRate === 'number' ? student.attendanceRate : 0;
    return rate;
  };

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-emerald-500">ممتاز</Badge>;
    if (rate >= 75) return <Badge className="bg-blue-500">جيد جداً</Badge>;
    if (rate >= 60) return <Badge className="bg-amber-500">جيد</Badge>;
    return <Badge className="bg-red-500">ضعيف</Badge>;
  };

  const handlePaymentToggle = (studentId: string, currentStatus: boolean) => {
    updatePaymentMutation.mutate({
      studentId: studentId,
      hasPaid: !currentStatus,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-emerald-900">طلابي (صلابي)</CardTitle>
              <CardDescription>إدارة ومتابعة الطلاب المسجلين في حلقتك</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="البحث عن طالب (الاسم، الجيل)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 border-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="rounded-lg border border-emerald-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="text-right font-bold text-emerald-900">الطالب</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الجيل/الصف</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">نسبة الحضور</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الأداء</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">حالة الدفع</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents?.map((student) => {
                  const attendanceRate = getAttendanceRate(student);
                  return (
                    <TableRow key={student.id} className="hover:bg-emerald-50/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {student.userName?.charAt(0) || 'ط'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{student.userName || 'غير محدد'}</p>
                            <p className="text-xs text-gray-500">{student.userPhone || '-'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-emerald-300">
                          {student.grade || 'غير محدد'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <BehaviorBar score={attendanceRate} size="sm" showLabel={false} />
                      </TableCell>
                      <TableCell>{getPerformanceBadge(attendanceRate)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-28 justify-center ${
                            student.hasPaid
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200'
                          }`}
                          onClick={() => handlePaymentToggle(student.id, student.hasPaid)}
                          disabled={updatePaymentMutation.isPending}
                        >
                          {student.hasPaid ? (
                            <>
                              <CheckCircle className="w-4 h-4 ml-1" />
                              تم الدفع
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 ml-1" />
                              لم يدفع
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => setLocation(`/teacher/students/${student.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {/* Add Edit button for student details if needed */}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredStudents?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد بيانات طلاب مسجلين في حلقتك</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

