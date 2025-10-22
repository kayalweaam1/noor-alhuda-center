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
import { UserPlus, Search, Edit, Trash2, Shield } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import AddUserModal from "@/components/modals/AddUserModal";
import EditUserModal from "@/components/modals/EditUserModal";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { data: users, refetch } = trpc.users.getAll.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation();
  const deleteUserMutation = trpc.users.delete.useMutation();

  const filteredUsers = users?.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: "admin" | "teacher" | "student") => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      toast.success("تم تحديث الدور بنجاح");
      refetch();
    } catch (error) {
      toast.error("فشل تحديث الدور");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      await deleteUserMutation.mutateAsync({ userId });
      toast.success("تم حذف المستخدم بنجاح");
      refetch();
    } catch (error: any) {
      const message = error?.message || '';
      toast.error(message || "فشل حذف المستخدم");
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-500">مدير</Badge>;
      case "teacher":
        return <Badge className="bg-emerald-500">مربي</Badge>;
      case "student":
        return <Badge className="bg-blue-500">طالب</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-emerald-900">إدارة المستخدمين</CardTitle>
              <CardDescription>إدارة جميع مستخدمي النظام</CardDescription>
            </div>
            <Button 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة مستخدم
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="البحث عن مستخدم (الاسم، البريد، رقم الهاتف)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 border-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-lg border border-emerald-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="text-right font-bold text-emerald-900">الاسم</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">رقم الهاتف</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الدور</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">تاريخ التسجيل</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id} className="hover:bg-emerald-50/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.name?.charAt(0) || '؟'}
                          </span>
                        </div>
                        <span>{user.name || 'غير محدد'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role || "student"}
                        onValueChange={(value) => handleRoleChange(user.id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">مدير</SelectItem>
                          <SelectItem value="teacher">مربي</SelectItem>
                          <SelectItem value="student">طالب</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(user.id)}
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

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-700">المدراء</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {users?.filter(u => u.role === 'admin').length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-emerald-700">المربين</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {users?.filter(u => u.role === 'teacher').length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">الطلاب</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {users?.filter(u => u.role === 'student').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddUserModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onSuccess={refetch}
      />
      
      <EditUserModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        user={selectedUser}
        onSuccess={refetch}
      />
    </div>
  );
}

