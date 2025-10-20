import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: "admin" | "teacher" | "student" | "assistant";
}

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export default function EditUserModal({ open, onOpenChange, user, onSuccess }: EditUserModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "teacher" | "student" | "assistant">("student");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setRole(user.role);
    }
  }, [user]);

  const updateUser = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المستخدم بنجاح");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error("فشل في تحديث المستخدم: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !name || !phone) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    updateUser.mutate({
      userId: user.id,
      name,
      phone,
      email: email || undefined,
      role,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
          <DialogDescription>
            قم بتحديث بيانات المستخدم
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+972501234567"
              dir="ltr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">الدور *</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">طالب</SelectItem>
                <SelectItem value="teacher">مربي</SelectItem>
                <SelectItem value="assistant">مساعد</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? "جاري التحديث..." : "تحديث البيانات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

