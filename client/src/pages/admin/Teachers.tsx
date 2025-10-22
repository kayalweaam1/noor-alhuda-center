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
import { UserPlus, Search, Edit, Trash2, Users, BookOpen } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AddTeacherModal from "@/components/modals/AddTeacherModal";
import EditTeacherModal from "@/components/modals/EditTeacherModal";

export default function TeachersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const { data: teachers, refetch } = trpc.teachers.getAll.useQuery();
  const deleteTeacherMutation = trpc.teachers.delete.useMutation();

  const filteredTeachers = teachers?.filter((teacher) =>
    teacher.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (teacherId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المربي؟")) return;
    try {
      await deleteTeacherMutation.mutateAsync({ id: teacherId });
      toast.success("تم حذف المربي بنجاح");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "فشل حذف المربي");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-emerald-700 mb-2">إجمالي المربين</p>
              <p className="text-4xl font-bold text-emerald-900">{teachers?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700">الطلاب النشطين</p>
              </div>
              <p className="text-4xl font-bold text-blue-900">
                0
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-amber-700">متوسط الطلاب/مربي</p>
              </div>
              <p className="text-4xl font-bold text-amber-900">
                0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-emerald-900">إدارة المربين</CardTitle>
              <CardDescription>إدارة جميع مربي المركز</CardDescription>
            </div>
            <Button 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة مربي
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="البحث عن مربي (الاسم، التخصص)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 border-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Teachers Table */}
          <div className="rounded-lg border border-emerald-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="text-right font-bold text-emerald-900">المربي</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">التخصص</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">عدد الطلاب</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">رقم الهاتف</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">تاريخ التعيين</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers?.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-emerald-50/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {teacher.userName?.charAt(0) || 'م'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{teacher.userName || 'غير محدد'}</p>
                          <p className="text-xs text-gray-500">{teacher.userEmail || '-'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-300">
                        {teacher.specialization || 'عام'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">0</span>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.userPhone || '-'}</TableCell>
                    <TableCell>
                      {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('ar-SA') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(teacher.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTeachers?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد بيانات</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTeacherModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onSuccess={refetch}
      />
      
      <EditTeacherModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        teacher={selectedTeacher}
        onSuccess={refetch}
      />
    </div>
  );
}

