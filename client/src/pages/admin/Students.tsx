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
import { UserPlus, Search, Edit, Trash2, Eye, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLocation } from "wouter";
import AddStudentModal from "@/components/modals/AddStudentModal";
import EditStudentModal from "@/components/modals/EditStudentModal";
import ImportStudentsModal from "@/components/modals/ImportStudentsModal";
import { exportStudents } from "@/lib/export";
import { Download, Upload } from "lucide-react";
import BehaviorBar from "@/components/BehaviorBar";

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [, setLocation] = useLocation();
  const { data: students, refetch } = trpc.students.getAll.useQuery();
  const deleteStudentMutation = trpc.students.delete.useMutation();
  const resetStudentMutation = trpc.dataReset.resetStudent.useMutation({
    onSuccess: () => {
      toast.success('تم تصفير بيانات الطالب بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error('فشل في تصفير بيانات الطالب: ' + error.message);
    },
  });

  // Grade order for sorting
  const gradeOrder = [
    'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن',
    'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'
  ];

  const filteredStudents = students
    ?.filter((student) =>
      student.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const gradeA = gradeOrder.indexOf(a.grade || '');
      const gradeB = gradeOrder.indexOf(b.grade || '');
      if (gradeA === -1) return 1;
      if (gradeB === -1) return -1;
      return gradeA - gradeB;
    });

  const handleDelete = async (studentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;
    try {
      await deleteStudentMutation.mutateAsync({ id: studentId });
      toast.success("تم حذف الطالب بنجاح");
      refetch();
    } catch (error: any) {
      toast.error("فشل في حذف الطالب: " + error.message);
    }
  };

  const handleResetStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`هل أنت متأكد من تصفير بيانات الطالب "${studentName}"؟\n\nسيتم حذف جميع سجلات الحضور والتقييمات لهذا الطالب.`)) return;
    resetStudentMutation.mutate({ studentId });
  };

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

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-blue-700 mb-2">إجمالي الطلاب</p>
              <p className="text-4xl font-bold text-blue-900">{students?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <p className="text-sm text-emerald-700">الحضور الممتاز</p>
              </div>
              <p className="text-4xl font-bold text-emerald-900">
                {students?.filter(s => getAttendanceRate(s) >= 90).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-amber-700 mb-2">يحتاج متابعة</p>
              <p className="text-4xl font-bold text-amber-900">
                {students?.filter(s => getAttendanceRate(s) < 75).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">غياب متكرر</p>
              </div>
              <p className="text-4xl font-bold text-red-900">
                {students?.filter(s => getAttendanceRate(s) < 60).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-emerald-900">إدارة الطلاب</CardTitle>
              <CardDescription>إدارة جميع طلاب المركز</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                onClick={() => exportStudents(students || [])}
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
              <Button 
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="w-4 h-4 ml-2" />
                استيراد
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                onClick={() => setShowAddModal(true)}
              >
                <UserPlus className="w-4 h-4 ml-2" />
                إضافة طالب
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="البحث عن طالب (الاسم، الحلقة، المربي)..."
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
                  <TableHead className="text-right font-bold text-emerald-900">الصف</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">التخصص</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">المربي</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">نسبة الحضور</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الأداء</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">تاريخ التسجيل</TableHead>
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
                        <Badge 
                          variant="outline" 
                          className={
                            student.specialization === 'تربية' ? 'border-blue-300 text-blue-700' :
                            student.specialization === 'تحفيظ' ? 'border-purple-300 text-purple-700' :
                            student.specialization === 'تربية وتحفيظ' ? 'border-amber-300 text-amber-700' :
                            'border-gray-300'
                          }
                        >
                          {student.specialization || 'غير محدد'}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.teacherName || 'غير محدد'}</TableCell>
                      <TableCell>
                        <BehaviorBar score={attendanceRate} size="sm" showLabel={false} />
                      </TableCell>
                      <TableCell>{getPerformanceBadge(attendanceRate)}</TableCell>
                      <TableCell>
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar-SA') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => setLocation(`/admin/students/${student.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-200 text-amber-600 hover:bg-amber-50"
                            onClick={() => handleResetStudent(student.id, student.userName || 'غير محدد')}
                            title="تصفير بيانات الطالب"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(student.id)}
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

          {filteredStudents?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد بيانات</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddStudentModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onSuccess={() => refetch()}
      />
      
      <EditStudentModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        student={selectedStudent}
        onSuccess={() => refetch()}
      />
      
      <ImportStudentsModal 
        open={showImportModal} 
        onOpenChange={setShowImportModal}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

