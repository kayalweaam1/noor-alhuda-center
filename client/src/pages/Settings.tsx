import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Key, User } from "lucide-react";

export default function Settings() {
  const { data: user } = trpc.auth.me.useQuery();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast.error("فشل في تغيير كلمة المرور: " + error.message);
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-600 mt-2">إدارة حسابك وإعداداتك الشخصية</p>
      </div>

      <div className="grid gap-6">
        {/* معلومات الحساب */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              <CardTitle>معلومات الحساب</CardTitle>
            </div>
            <CardDescription>معلوماتك الشخصية في النظام</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-600">الاسم</Label>
              <p className="text-lg font-medium">{user?.name || "غير محدد"}</p>
            </div>
            <div>
              <Label className="text-gray-600">رقم الهاتف</Label>
              <p className="text-lg font-medium" dir="ltr">{user?.phone || "غير محدد"}</p>
            </div>
            <div>
              <Label className="text-gray-600">الدور</Label>
              <p className="text-lg font-medium">
                {user?.role === "admin" && "مدير"}
                {user?.role === "teacher" && "مربي"}
                {user?.role === "student" && "طالب"}
                {user?.role === "assistant" && "مساعد"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* تغيير كلمة المرور */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-600" />
              <CardTitle>تغيير كلمة المرور</CardTitle>
            </div>
            <CardDescription>قم بتحديث كلمة المرور الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الحالية"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

