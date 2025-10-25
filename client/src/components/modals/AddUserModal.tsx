import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { GRADES } from "@shared/consts";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddUserModal({ open, onOpenChange, onSuccess }: AddUserModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+972");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "teacher" | "student">("student");
  const [grade, setGrade] = useState<string | undefined>(undefined);
  const [specialization, setSpecialization] = useState<"تربية" | "تحفيظ" | "تربية وتحفيظ">("تحفيظ");
  const [hasPaid, setHasPaid] = useState(false);

  const createUser = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المستخدم بنجاح");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error("فشل في إضافة المستخدم: " + error.message);
    },
  });

  const resetForm = () => {
    setName("");
    setPhone("+972");
    setEmail("");
    setPassword("");
    setRole("student");
    setSpecialization("تحفيظ");
    setHasPaid(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !password) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createUser.mutate({
      name,
      phone,
      email: email || undefined,
      password,
      role,
      grade: grade || undefined,
      specialization: (role === 'teacher' || role === 'student') ? specialization : undefined,
      hasPaid: role === 'student' ? hasPaid : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          <DialogDescription>
            أدخل بيانات المستخدم الجديد
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
            <Label htmlFor="password">كلمة المرور *</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">الدور *</Label>
            <Select value={role} onValueChange={(value: any) => {
              setRole(value);
              if (value === 'student' || value === 'teacher') {
                setGrade(GRADES[0]); // Set default grade for student/teacher
              } else {
                setGrade(undefined);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">طالب</SelectItem>
                <SelectItem value="teacher">مربي</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
              </SelectContent>
            </Select>
          </div>

	          {role !== "admin" && (
	            <div className="space-y-2">
	              <Label htmlFor="grade">الجيل / الصف *</Label>
	              <Select value={grade} onValueChange={(value: any) => setGrade(value)}>
	                <SelectTrigger>
	                  <SelectValue placeholder="اختر الجيل / الصف" />
	                </SelectTrigger>
	                <SelectContent>
	                  {GRADES.map((g) => (
	                    <SelectItem key={g} value={g}>{g}</SelectItem>
	                  ))}
	                </SelectContent>
	              </Select>
	            </div>
	          )}

          {(role === "teacher" || role === "student") && (
            <div className="space-y-2">
              <Label htmlFor="specialization">التخصص *</Label>
              <Select value={specialization} onValueChange={(value: any) => setSpecialization(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر التخصص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="تربية">تربية</SelectItem>
                  <SelectItem value="تحفيظ">تحفيظ</SelectItem>
                  <SelectItem value="تربية وتحفيظ">تربية وتحفيظ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {role === "student" && (
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="hasPaid"
                checked={hasPaid}
                onChange={(e) => setHasPaid(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <Label htmlFor="hasPaid" className="cursor-pointer">دفع الرسوم</Label>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={createUser.isPending}
            >
              {createUser.isPending ? "جاري الإضافة..." : "إضافة المستخدم"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

