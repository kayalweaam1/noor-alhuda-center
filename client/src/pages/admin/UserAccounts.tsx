import { trpc } from "@/lib/trpc";
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
import { Key, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

export default function UserAccountsPage() {
  const { data: users } = trpc.users.getAll.useQuery();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, userId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(userId);
    toast.success("تم النسخ إلى الحافظة");
    setTimeout(() => setCopiedId(null), 2000);
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
    <div className="p-6 space-y-6" dir="rtl">
      <BackButton />
      
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="w-8 h-8 text-emerald-600" />
            <div>
              <CardTitle className="text-2xl text-emerald-900">حسابات المستخدمين</CardTitle>
              <CardDescription>عرض أسماء المستخدمين وكلمات المرور (للمدير فقط)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-emerald-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="text-right font-bold text-emerald-900">الاسم</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الدور</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">اسم المستخدم</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">كلمة المرور</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
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
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                        {user.username || user.phone || '-'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                        123456
                      </code>
                      <span className="text-xs text-gray-500 mr-2">(افتراضي)</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(user.username || user.phone || '', user.id)}
                          className="text-xs"
                        >
                          {copiedId === user.id ? (
                            <CheckCircle className="w-3 h-3 ml-1 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 ml-1" />
                          )}
                          نسخ
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>ملاحظة:</strong> كلمة المرور الافتراضية لجميع المستخدمين هي <code className="bg-yellow-100 px-2 py-1 rounded">123456</code>. 
              يمكن للمستخدمين تغييرها من صفحة الملف الشخصي.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

